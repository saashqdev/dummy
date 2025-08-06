'use server'

import { redirect } from 'next/navigation'
import { getServerTranslations } from '@/i18n/server'
import { db } from '@/db'
import { createUserSession, getUserInfo } from '@/lib/services/session.server'
import bcrypt from 'bcryptjs'
import { getAppConfiguration } from '@/modules/core/services/AppConfigurationService'
import { getClientIPAddress } from '@/lib/utils/IpUtils'
import { autosubscribeToTrialOrFreePlan } from '@/modules/subscriptions/services/PricingService'
import { getBaseURL } from '@/lib/services/url.server'
import { stripeService } from '@/modules/subscriptions/services/StripeService'
import AuthUtils, { RegistrationData } from '../utils/AuthUtils'
import { createUser, getDefaultTenant } from './UserService'
import { sendEmail } from '@/modules/emails/services/EmailService'
import EmailTemplates from '@/modules/emails/utils/EmailTemplates'
import { AppConfigurationDto } from '@/modules/core/dtos/AppConfigurationDto'
import { addTenantUser, createTenant } from './TenantService'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { headers } from 'next/headers'
import crypto from 'crypto'

function getHome({
  isAdmin,
  defaultTenant,
}: {
  isAdmin: boolean
  defaultTenant: { slug: string } | null
}) {
  let appHome = ''
  if (isAdmin) {
    appHome = '/admin/dashboard'
  } else if (defaultTenant) {
    appHome = `/app/${encodeURIComponent(defaultTenant.slug)}/dashboard`
  } else {
    appHome = '/app'
  }
  return appHome
}

export async function actionLogin(prev: any, form: FormData) {
  const email = form.get('email')?.toString().toLowerCase().trim()
  try {
    const userInfo = await getUserInfo()
    const { t } = await getServerTranslations()
    const password = form.get('password')
    const redirectTo = form.get('redirectTo')
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof redirectTo !== 'string'
    ) {
      throw new Error('Invalid form data')
    }

    if (!AuthUtils.validateEmail(email)) {
      throw new Error('Invalid email')
    } else if (!AuthUtils.validatePassword(password)) {
      throw new Error('Invalid password')
    }

    const user = await db.user.getByEmail(email)
    if (process.env.NODE_ENV !== 'development') {
      const testAccounts = [
        'admin@email.com',
        'john.doe@company.com',
        'luna.davis@company.com',
        'alex.martinez@company.com',
      ]
      if (testAccounts.includes(email)) {
        // return json({ fields: { email, password }, error: "You cannot use this account in production." }, { status: 400 });
        throw new Error('You cannot use this account in production.')
      }
    }
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        const countUsers = await db.user.count()
        if (countUsers === 0) {
          throw Error('There are no users in the database. Seed the database first.')
        }
      }
      // return json({ fields, error: t("api.errors.invalidPassword") }, { status: 400 });
      throw new Error(t('api.errors.invalidPassword'))
    }

    const existingPasswordHash = await db.user.getPasswordHash(user.id)
    const isCorrectPassword = await bcrypt.compare(password, existingPasswordHash ?? '')
    if (!isCorrectPassword) {
      // return json({ fields, error: t("api.errors.invalidPassword") }, { status: 400 });
      throw new Error(t('api.errors.invalidPassword'))
    }

    const defaultTenant = await getDefaultTenant(user)
    const appHome = getHome({
      isAdmin: !!user.admin,
      defaultTenant,
    })
    return await createUserSession(
      {
        ...userInfo,
        userId: user.id,
      },
      redirectTo.length > 0 ? redirectTo : appHome,
    )
  } catch (e: any) {
    if (isRedirectError(e)) {
      throw e
    }
    // eslint-disable-next-line no-console
    console.log(e.message)
    return {
      email,
      error: e.message as string,
    }
  }
}

export async function actionRegister(prev: any, form: FormData) {
  const { t } = await getServerTranslations()
  const userInfo = await getUserInfo()
  try {
    const registrationData = await AuthUtils.getRegistrationFormData(form)
    const result = await validateRegistration({ registrationData, addToTrialOrFreePlan: true })
    if (result.verificationRequired) {
      await createRegistrationForm({
        ...registrationData,
        email: result.email,
        ipAddress: result.ipAddress,
        recreateToken: false,
      })
      return { verificationEmailSent: true }
    } else if (result.registered) {
      const defaultTenant = await getDefaultTenant(result.registered.user)
      const home = getHome({
        isAdmin: false,
        defaultTenant,
      })
      return await createUserSession(
        {
          ...userInfo,
          userId: result.registered.user.id,
        },
        home,
      )
    }
    throw new Error(t('shared.unknownError'))
  } catch (e: any) {
    if (isRedirectError(e)) {
      throw e
    }
    // eslint-disable-next-line no-console
    console.log(e.message)
    throw new Error(t(e.message))
  }
}

export async function actionVerify(prev: any, form: FormData) {
  const verificationId = form.get('verificationId')?.toString() ?? ''
  const { t } = await getServerTranslations()
  const userInfo = await getUserInfo()

  const registration = await db.userRegistrationAttempt.getByToken(verificationId)
  console.log({ registration, verificationId })
  if (!registration || registration.createdTenantId) {
    return { error: t('api.errors.userAlreadyRegistered') }
  }

  try {
    const registrationData = await AuthUtils.getRegistrationFormData(form)
    const result = await validateRegistration({
      registrationData,
      checkEmailVerification: false,
      addToTrialOrFreePlan: true,
    })
    if (!result.registered) {
      throw new Error(t('shared.unknownError'))
    }
    const defaultTenant = await getDefaultTenant(result.registered.user)
    const appHome = getHome({
      isAdmin: false,
      defaultTenant,
    })
    return await createUserSession(
      {
        ...userInfo,
        userId: result.registered.user.id,
      },
      appHome,
    )
  } catch (e: any) {
    if (isRedirectError(e)) {
      throw e
    }
    return { error: e.message as string }
  }
}

export async function validateRegistration({
  registrationData,
  addToTrialOrFreePlan,
  checkEmailVerification = true,
  stripe_customer_id,
}: {
  registrationData: RegistrationData
  addToTrialOrFreePlan: boolean
  checkEmailVerification?: boolean
  stripe_customer_id?: string
}) {
  const { t } = await getServerTranslations()
  const appConfiguration = await getAppConfiguration()
  const { email, password, company, firstName, lastName, avatar, slug } = registrationData
  if (!email || !AuthUtils.validateEmail(email)) {
    throw Error(t('account.register.errors.invalidEmail'))
  }
  if (!appConfiguration.auth.requireEmailVerification && !AuthUtils.validatePassword(password)) {
    throw Error(t('account.register.errors.passwordRequired'))
  } else if (appConfiguration.auth.requireOrganization && typeof company !== 'string') {
    throw Error(t('account.register.errors.organizationRequired'))
  } else if (
    appConfiguration.auth.requireName &&
    (typeof firstName !== 'string' || typeof lastName !== 'string')
  ) {
    throw Error(t('account.register.errors.nameRequired'))
  }

  if (company && company.length > 100) {
    throw Error('Maximum length for company name is 100 characters')
  } else if (firstName && firstName.length > 50) {
    throw Error('Maximum length for first name is 50 characters')
  } else if (lastName && lastName.length > 50) {
    throw Error('Maximum length for last name is 50 characters')
  }

  const heads = await headers()
  const ipAddress = getClientIPAddress(heads)?.toString() ?? ''
  // eslint-disable-next-line no-console
  console.log('[REGISTRATION ATTEMPT]', {
    email,
    domain: email.substring(email.lastIndexOf('@') + 1),
    ipAddress,
  })

  const existingUser = await db.user.getByEmail(email)
  if (existingUser) {
    throw Error(t('api.errors.userAlreadyRegistered'))
  }

  if (checkEmailVerification && appConfiguration.auth.requireEmailVerification) {
    return { email, ipAddress, verificationRequired: true }
  }
  const registered = await createUserAndTenant({
    email,
    password,
    company,
    firstName,
    lastName,
    stripe_customer_id,
    avatar,
    slug,
    appConfiguration,
  })
  if (addToTrialOrFreePlan) {
    await autosubscribeToTrialOrFreePlan({ tenantId: registered.tenant.id })
  }
  return { email, ipAddress, verificationRequired: false, registered }
}

async function createRegistrationForm({
  email,
  company,
  firstName,
  lastName,
  ipAddress,
  recreateToken,
  slug,
}: {
  email: string
  ipAddress: string
  company?: string
  firstName?: string
  lastName?: string
  recreateToken?: boolean
  slug?: string
}) {
  const appConfiguration = await getAppConfiguration()
  const registration = await db.userRegistrationAttempt.getByEmail(email)
  if (registration) {
    if (registration.createdTenantId) {
      throw Error('api.errors.userAlreadyRegistered')
    } else {
      if (recreateToken) {
        const newToken = crypto.randomBytes(20).toString('hex')
        await db.userRegistrationAttempt.update(registration.id, {
          firstName,
          lastName,
          company,
          token: newToken,
        })
        await sendEmail({
          to: email,
          ...EmailTemplates.VERIFICATION_EMAIL.parse({
            appConfiguration,
            name: firstName,
            action_url: (await getBaseURL()) + `/verify/` + newToken,
          }),
        })
      }
    }
  } else {
    var token = crypto.randomBytes(20).toString('hex')
    await db.userRegistrationAttempt.create({
      email,
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      company: company ?? '',
      token,
      ipAddress,
      slug: slug ?? null,
      createdTenantId: null,
    })
    await sendEmail({
      to: email,
      ...EmailTemplates.VERIFICATION_EMAIL.parse({
        name: firstName,
        action_url: (await getBaseURL()) + `/verify/` + token,
        appConfiguration,
      }),
    })
  }
}

interface CreateUserAndTenantDto {
  email: string
  password?: string
  company?: string
  firstName?: string
  lastName?: string
  stripe_customer_id?: string
  avatar?: string
  locale?: string
  slug?: string
  appConfiguration: AppConfigurationDto
}
async function createUserAndTenant({
  email,
  password,
  company,
  firstName,
  lastName,
  stripe_customer_id,
  avatar,
  locale,
  slug,
  appConfiguration,
}: CreateUserAndTenantDto) {
  let tenantName = company ?? email.split('@')[0]
  if (!stripe_customer_id && process.env.STRIPE_SK) {
    const stripeCustomer = await stripeService.createStripeCustomer(email, tenantName)
    if (!stripeCustomer) {
      throw Error('Could not create Stripe customer')
    }
    stripe_customer_id = stripeCustomer.id
  }

  const user = await createUser({
    email: email,
    firstName,
    lastName,
    password,
    avatar,
    locale,
    defaultTenantId: null,
  })
  const tenant = await createTenant({ name: tenantName, stripe_customer_id, slug, userId: user.id })
  if (!tenant) {
    throw Error('Could not create tenant')
  }
  if (!user) {
    throw Error('Could not create user')
  }
  await addTenantUser({
    tenantId: tenant.id,
    userId: user.id,
  })

  await sendEmail({
    to: email,
    ...EmailTemplates.WELCOME_EMAIL.parse({
      name: firstName,
      appConfiguration,
      action_url: (await getBaseURL()) + `/login`,
    }),
  })

  return { user, tenant }
}
