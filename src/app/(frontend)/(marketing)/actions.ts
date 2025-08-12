'use server'

import { getUserInfo, createUserSession } from '@/lib/services/session.server'
import { getServerTranslations } from '@/i18n/server'
import { revalidatePath } from 'next/cache'
import { PricingBlockService } from '@/modules/pageBlocks/blocks/marketing/pricing/PricingBlockService.server'

export async function actionToggleScheme(formData: FormData) {
  const redirectTo = formData.get('redirectTo') as string
  const userInfo = await getUserInfo()
  userInfo.scheme = userInfo.scheme === 'light' ? 'dark' : 'light'
  console.log({
    scheme: userInfo.scheme,
  })
  return await createUserSession(userInfo, redirectTo || '/')
  // return redirect(redirectTo || "/");
}

export async function actionSetTheme(formData: FormData) {
  const redirectTo = formData.get('redirectTo') as string
  const userInfo = await getUserInfo()
  return await createUserSession(
    {
      ...userInfo,
      theme: formData.get('theme') as string,
    },
    redirectTo || '/',
  )
  // return redirect(redirectTo || "/");
}

export async function actionLogout() {
  console.log('logout')
  const userInfo = await getUserInfo()
  return await createUserSession(
    {
      ...userInfo,
      userId: null,
    },
    '/',
  )
  // return redirect("/");
}

export async function actionPricing(form: FormData): Promise<any> {
  const { t } = await getServerTranslations()
  const action = form.get('action')
  if (action === 'subscribe') {
    const response = await PricingBlockService.subscribe({ form, t })
    revalidatePath('/pricing')
    return response
  }
}
