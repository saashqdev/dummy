'use server'

import { getUserInfo, createUserSession } from '@/lib/services/session.server'

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

export async function actionLogout(formData: FormData) {
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
