import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { eq } from 'drizzle-orm'
import { user_registration_attempt } from '@/db/schema'
import { IUserRegistrationAttemptDb } from '@/db/interfaces/accounts/IUserRegistrationAttemptDb'
import { UserRegistrationAttemptModel } from '@/db/models'

export class UserRegistrationAttemptDbDrizzle implements IUserRegistrationAttemptDb {
  async getByEmail(email: string): Promise<UserRegistrationAttemptModel | null> {
    const result = await payload.db.tables.user_registration_attempt
      .select()
      .from(user_registration_attempt)
      .where(eq(user_registration_attempt.email, email))
      .limit(1)
    return result[0] || null
  }

  async getByToken(token: string): Promise<UserRegistrationAttemptModel | null> {
    const result = await payload.db.tables
      .select()
      .from(user_registration_attempt)
      .where(eq(user_registration_attempt.token, token))
      .limit(1)
    return result[0] || null
  }

  async create(
    data: Omit<UserRegistrationAttemptModel, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    const id = createId()
    const [result] = await payload.db.tables
      .insert(user_registration_attempt)
      .values({
        id,
        created_at: new Date(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        token: data.token,
        company: data.company,
        ipAddress: data.ipAddress,
        slug: data.slug,
      })
      .returning({ id: user_registration_attempt.id })
    return result.id
  }

  async update(
    id: string,
    data: {
      firstName?: string
      lastName?: string
      company?: string | null
      created_tenant_id?: string | null
      token?: string
    },
  ): Promise<void> {
    await payload.db.tables
      .update(user_registration_attempt)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        created_tenant_id: data.created_tenant_id,
        token: data.token,
      })
      .where(eq(user_registration_attempt.id, id))
  }
}
