'use server'

import { getUserInfo, resetUserSession } from '@/lib/services/session.server'
import { getUser } from '@/modules/accounts/services/UserService'
import { clearAllCache, getCachedValues } from '@/lib/services/cache.server'
import { db } from '@/db'
import DevComponent from './component'
import { actionLogin } from '@/modules/accounts/services/AuthService'
import { revalidatePath } from 'next/cache'
import SeedService from '@/modules/core/services/SeedService'

const loader = async () => {
  const userInfo = await getUserInfo()
  const user = await getUser(userInfo.userId || '')
  if (process.env.NODE_ENV !== 'development' && !user?.admin) {
    // return json({ error: "This route is only available in development" }, { status: 404 });
    throw new Error('This route is only available in development')
  }
  const cachedValues = await getCachedValues()
  const users = await db.user.count()
  return {
    cachedValues,
    databaseState: {
      alreadySeeded: users > 0,
      users,
      tenants: await db.tenant.count(),
    },
  }
}

export const actionDev = async (prev: any, form: FormData) => {
  const action = form.get('action')?.toString()
  if (action === 'clearCache') {
    const cachedValues = await getCachedValues()
    const keyCount = cachedValues.length
    await clearAllCache()
    revalidatePath('/dev')
    return {
      success: `Cleared ${keyCount} keys from cache: ${cachedValues.map((cv) => cv.key).join(', ')}`,
    }
  } else if (action === 'seed') {
    try {
      await SeedService.seed()
      return { success: 'Seeded database' }
    } catch (e: any) {
      return { error: e.message }
    }
  }
  // else if (action === "logout") {
  //   await resetUserSession();
  //   return { success: "Logged out" };
  // } else if (action === "login") {
  //   const form = new FormData();
  //   form.set("email", "admin@email.com");
  //   form.set("password", "password");
  //   form.set("redirectTo", "/dev");
  //   return actionLogin(null, form);
  // }
}

export default async function DevRoute() {
  const data = await loader()
  return <DevComponent data={data} />
}
