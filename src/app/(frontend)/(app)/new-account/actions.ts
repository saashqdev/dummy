'use server'

import { db } from '@/db'
import { TenantDto } from '@/db/models'
import { addTenantUser, createTenant } from '@/modules/accounts/services/TenantService'
import { getUserInfo } from '@/lib/services/session.server'
import { redirect } from 'next/navigation'
import { getUser } from '@/modules/accounts/services/UserService'

export const actionNewAccount = async (prev: any, form: FormData) => {
  const userInfo = await getUserInfo()
  const user = userInfo.userId ? await getUser(userInfo.userId) : null
  if (!user) {
    throw redirect(`/login`)
  }
  let createdTenant: TenantDto | null = null
  try {
    const name = form.get('name')?.toString() ?? ''
    const slug = form.get('slug')?.toString()
    createdTenant = await createTenant({ name, slug, userId: user.id })
    const roles = await db.role.getAll('app')
    await addTenantUser({
      tenantId: createdTenant.id,
      userId: user.id,
      roles,
    })
  } catch (e: any) {
    return { error: e.message }
  }
  return redirect(`/app/${createdTenant.slug}/dashboard`)
}
