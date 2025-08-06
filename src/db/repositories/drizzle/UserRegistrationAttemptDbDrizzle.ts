// UserRegistrationAttemptDbDrizzle.ts
import { createId } from '@paralleldrive/cuid2'
import { eq } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { UserRegistrationAttempt } from '@/db/config/drizzle/schema'
import { IUserRegistrationAttemptDb } from '@/db/interfaces/accounts/IUserRegistrationAttemptDb'
import { UserRegistrationAttemptModel } from '@/db/models'

export class UserRegistrationAttemptDbDrizzle implements IUserRegistrationAttemptDb {
  async getByEmail(email: string): Promise<UserRegistrationAttemptModel | null> {
    const result = await drizzleDb
      .select()
      .from(UserRegistrationAttempt)
      .where(eq(UserRegistrationAttempt.email, email))
      .limit(1)
    return result[0] || null
  }

  async getByToken(token: string): Promise<UserRegistrationAttemptModel | null> {
    const result = await drizzleDb
      .select()
      .from(UserRegistrationAttempt)
      .where(eq(UserRegistrationAttempt.token, token))
      .limit(1)
    return result[0] || null
  }

  async create(
    data: Omit<UserRegistrationAttemptModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    const [result] = await drizzleDb
      .insert(UserRegistrationAttempt)
      .values({
        id,
        created_at: new Date(),
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        token: data.token,
        company: data.company,
        ipAddress: data.ipAddress,
        slug: data.slug,
      })
      .returning({ id: UserRegistrationAttempt.id })
    return result.id
  }

  async update(
    id: string,
    data: {
      first_name?: string
      last_name?: string
      company?: string | null
      created_tenant_id?: string | null
      token?: string
    },
  ): Promise<void> {
    await drizzleDb
      .update(UserRegistrationAttempt)
      .set({
        first_name: data.first_name,
        last_name: data.last_name,
        company: data.company,
        created_tenant_id: data.created_tenant_id,
        token: data.token,
      })
      .where(eq(UserRegistrationAttempt.id, id))
  }
}
