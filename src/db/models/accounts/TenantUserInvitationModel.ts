import { TenantModel } from '..'

export type TenantUserInvitationModel = {
  id: string
  tenant_id: string
  email: string
  firstName: string
  lastName: string
  pending: boolean
  created_user_id: string | null
  from_user_id: string | null
}

export type TenantUserInvitationWithTenantDto = TenantUserInvitationModel & {
  tenant: TenantModel
}
