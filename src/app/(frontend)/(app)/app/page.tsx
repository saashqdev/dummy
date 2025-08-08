'use server'

import { db } from '@/db'
import { TenantDto, UserDto } from '@/db/models'
import { getUserInfo } from '@/lib/services/session.server'
import { getUser } from '@/modules/accounts/services/UserService'
import { redirect } from 'next/navigation'
import Component from './component'

export type AppIndexLoaderData = {
  user: UserDto
  myTenants: TenantDto[]
}

const loader = async () => {
  const userInfo = await getUserInfo()
  if (!userInfo.userId) {
    throw redirect(`/login`)
  }
  const user = await getUser(userInfo.userId)
  if (!userInfo.userId || !user) {
    throw redirect(`/login`)
  }
  const myTenants = await db.tenant.getByUser(userInfo.userId!)
  if (myTenants.length === 1) {
    return redirect('/app/' + encodeURIComponent(myTenants[0].slug) + '/dashboard')
  }
  // if (myTenants.length === 0 && user.admin) {
  //   return redirect("/admin");
  // }

  const data: AppIndexLoaderData = {
    user,
    myTenants,
  }
  return data
}

export default async function () {
  const data = await loader()
  return <Component data={data} />
}
