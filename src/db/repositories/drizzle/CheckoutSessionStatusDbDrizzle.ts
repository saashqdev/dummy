import { eq } from 'drizzle-orm'
import payload from 'payload'
import { checkout_session_status } from '@/db/schema'
import { ICheckoutSessionStatusDb } from '@/db/interfaces/subscriptions/ICheckoutSessionStatusDb'
import { CheckoutSessionStatusModel } from '@/db/models'

export class CheckoutSessionStatusDbDrizzle implements ICheckoutSessionStatusDb {
  async get(id: string): Promise<CheckoutSessionStatusModel | null> {
    const results = await payload.db.tables
      .select()
      .from(checkout_session_status)
      .where(eq(checkout_session_status.id, id))
      .limit(1)
    return results.length > 0 ? results[0] : null
  }

  async create(data: {
    id: string
    email: string
    from_url: string
    from_user_id?: string | null
    from_tenant_id?: string | null
  }): Promise<string> {
    await payload.db.tables.insert(checkout_session_status).values({
      id: data.id,
      pending: true,
      email: data.email,
      from_url: data.from_url,
      from_userId: data.from_user_id ?? null,
      from_tenant_id: data.from_tenant_id ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    })
    return data.id
  }

  async update(
    id: string,
    data: { pending: boolean; created_user_id?: string | null; created_tenant_id?: string | null },
  ): Promise<void> {
    await payload.db.tables
      .update(checkout_session_status)
      .set({
        pending: data.pending,
        created_userId: data.created_user_id ?? null,
        created_tenant_id: data.created_tenant_id ?? null,
        updated_at: new Date(),
      })
      .where(eq(checkout_session_status.id, id))
  }
}
