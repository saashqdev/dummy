import { IAppConfigurationDb } from './interfaces/core/IAppConfigurationDb'
import { AppConfigurationDbDrizzle } from './repositories/drizzle/AppConfigurationDbDrizzle'
import { IUserDb } from './interfaces/accounts/IUserDb'
import { UserDbDrizzle } from './repositories/drizzle/UserDbDrizzle'
import { ITenantDb } from './interfaces/accounts/ITenantDb'
import { ITenantUserDb } from './interfaces/accounts/ITenantUserDb'
import { ITenantUserInvitationDb } from './interfaces/accounts/ITenantUserInvitationDb'
import { TenantDbDrizzle } from './repositories/drizzle/TenantDbDrizzle'
import { TenantUserInvitationDbDrizzle } from './repositories/drizzle/TenantUserInvitationDbDrizzle'
import { TenantUserDbDrizzle } from './repositories/drizzle/TenantUserDbDrizzle'
import { IUserRegistrationAttemptDb } from './interfaces/accounts/IUserRegistrationAttemptDb'
import { UserRegistrationAttemptDbDrizzle } from './repositories/drizzle/UserRegistrationAttemptDbDrizzle'
import { ITenantSubscriptionDb } from './interfaces/subscriptions/ITenantSubscriptionDb'
import { TenantSubscriptionDbDrizzle } from './repositories/drizzle/TenantSubscriptionDbDrizzle'
import { IRoleDb } from './interfaces/permissions/IRoleDb'
import { RoleDbDrizzle } from './repositories/drizzle/RoleDbDrizzle'
import { IUserRoleDb } from './interfaces/permissions/IUserRoleDb'
import { UserRoleDbDrizzle } from './repositories/drizzle/UserRoleDbDrizzle'
import { IPermissionDb } from './interfaces/permissions/IPermissionDb'
import { PermissionDbDrizzle } from './repositories/drizzle/PermissionDbDrizzle'
import { ICreditDb } from './interfaces/subscriptions/ICreditDb'
import { CreditDbDrizzle } from './repositories/drizzle/CreditDbDrizzle'
import { IRolePermissionDb } from './interfaces/permissions/IRolePermissionDb'
import { RolePermissionDbDrizzle } from './repositories/drizzle/RolePermissionDbDrizzle'
import { CheckoutSessionStatusDbDrizzle } from './repositories/drizzle/CheckoutSessionStatusDbDrizzle'
import { ICheckoutSessionStatusDb } from './interfaces/subscriptions/ICheckoutSessionStatusDb'
import { ISubscriptionFeatureDb } from './interfaces/subscriptions/ISubscriptionFeatureDb'
import { SubscriptionFeatureDbDrizzle } from './repositories/drizzle/SubscriptionFeatureDbDrizzle'
import { ISubscriptionProductDb } from './interfaces/subscriptions/ISubscriptionProductDb'
import { SubscriptionProductDbDrizzle } from './repositories/drizzle/SubscriptionProductDbDrizzle'
import { ITenantSubscriptionProductDb } from './interfaces/subscriptions/ITenantSubscriptionProductDb'
import { TenantSubscriptionProductDbDrizzle } from './repositories/drizzle/TenantSubscriptionProductDbDrizzle'
import { defaultAppConfiguration } from '@/modules/core/data/defaultAppConfiguration'

export type DatabaseOrm = 'drizzle'
export class Database {
  provider: DatabaseOrm | undefined
  appConfiguration: IAppConfigurationDb
  user: IUserDb
  userRegistrationAttempt: IUserRegistrationAttemptDb
  tenant: ITenantDb
  tenantUser: ITenantUserDb
  tenantUserInvitation: ITenantUserInvitationDb
  tenantSubscription: ITenantSubscriptionDb
  credit: ICreditDb
  role: IRoleDb
  userRole: IUserRoleDb
  permission: IPermissionDb
  rolePermission: IRolePermissionDb
  checkoutSessionStatus: ICheckoutSessionStatusDb
  subscriptionFeature: ISubscriptionFeatureDb
  subscription_product: ISubscriptionProductDb
  tenantSubscriptionProduct: ITenantSubscriptionProductDb
  constructor(provider?: DatabaseOrm) {
    let providerValue = provider || defaultAppConfiguration.app.orm
    if (!providerValue) {
      throw new Error('defaultAppConfiguration.app.orm is not defined. Valid values are: drizzle')
    }
    // console.log("[inTake] Using database ORM: " + providerValue);
    switch (providerValue) {
      case 'drizzle':
        this.provider = 'drizzle'
        this.appConfiguration = new AppConfigurationDbDrizzle()
        this.user = new UserDbDrizzle()
        this.userRegistrationAttempt = new UserRegistrationAttemptDbDrizzle()
        this.tenant = new TenantDbDrizzle()
        this.tenantUser = new TenantUserDbDrizzle()
        this.tenantUserInvitation = new TenantUserInvitationDbDrizzle()
        this.tenantSubscription = new TenantSubscriptionDbDrizzle()
        this.credit = new CreditDbDrizzle()
        this.role = new RoleDbDrizzle()
        this.userRole = new UserRoleDbDrizzle()
        this.permission = new PermissionDbDrizzle()
        this.rolePermission = new RolePermissionDbDrizzle()
        this.checkoutSessionStatus = new CheckoutSessionStatusDbDrizzle()
        this.subscriptionFeature = new SubscriptionFeatureDbDrizzle()
        this.subscription_product = new SubscriptionProductDbDrizzle()
        this.tenantSubscriptionProduct = new TenantSubscriptionProductDbDrizzle()
        break
      default:
        throw new Error(
          'Invalid defaultAppConfiguration.app.orm: ' +
            providerValue +
            '. Valid values are: drizzle, mock',
        )
    }
  }
}

let db = new Database()
export { db }
