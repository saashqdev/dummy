import { TFunction } from 'i18next'

export type RegistrationData = {
  email?: string
  password?: string
  company?: string
  first_name?: string
  last_name?: string
  avatar?: string
  slug?: string
}
async function getRegistrationFormData(formData: FormData): Promise<RegistrationData> {
  const email = formData.get('email')?.toString().toLowerCase().trim()
  const password = formData.get('password')?.toString()
  const company = formData.get('company')?.toString()
  const first_name = formData.get('first-name')?.toString()
  const last_name = formData.get('last-name')?.toString()
  const slug = formData.get('slug')?.toString()

  return { email, password, company, first_name, last_name, slug }
}

const validateEmail = (email: unknown) => {
  const regexp = new RegExp(
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )
  if (typeof email !== 'string' || email.length < 5 || !regexp.test(email) || email.length > 100) {
    return false
  }
  return true
}

const validatePassword = (password: unknown) => {
  if (typeof password !== 'string' || password.length < 4) {
    return false
  }
  return true
}

const validatePasswords = ({
  password,
  passwordConfirm,
  t,
}: {
  password?: string
  passwordConfirm?: string
  t: TFunction
}) => {
  if (!validatePassword(password)) {
    return 'Minimum of 4 characters'
  }
  if (!password || !passwordConfirm) {
    return t('shared.isRequired', { 0: t('account.shared.password') })
  }
  if (password !== passwordConfirm) {
    return t('account.shared.passwordMismatch')
  }
}

export default {
  getRegistrationFormData,
  validateEmail,
  validatePassword,
  validatePasswords,
}
