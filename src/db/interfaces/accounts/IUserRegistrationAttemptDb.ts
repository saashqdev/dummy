import { UserRegistrationAttemptModel } from '../../models'

export interface IUserRegistrationAttemptDb {
  getByEmail(email: string): Promise<UserRegistrationAttemptModel | null>
  getByToken(token: string): Promise<UserRegistrationAttemptModel | null>
  create(
    data: Omit<UserRegistrationAttemptModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string>
  update(
    id: string,
    data: {
      firstName?: string
      lastName?: string
      company?: string | null
      created_tenant_id?: string | null
      token?: string
    },
  ): Promise<void>
}
