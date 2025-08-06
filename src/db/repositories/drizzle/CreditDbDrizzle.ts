import { createId } from '@paralleldrive/cuid2'
import { and, count, desc, eq, gte, like, lt, or, SQL, sum } from 'drizzle-orm'
import { drizzleDb } from '@/db/config/drizzle/database'
import { Credit } from '@/db/config/drizzle/schema'
import { ICreditDb } from '@/db/interfaces/subscriptions/ICreditDb'
import { CreditWithDetailsDto } from '@/db/models'
import { PaginationDto } from '@/lib/dtos/PaginationDto'

export class CreditDbDrizzle implements ICreditDb {
  async getAllWithPagination({
    filters,
    pagination,
  }: {
    filters: {
      tenant_id: string | null
      q?: string | null
      user_id?: string | null
      type?: string | null
    }
    pagination: { page_size: number; page: number }
  }): Promise<{ items: CreditWithDetailsDto[]; pagination: PaginationDto }> {
    let whereConditions: SQL[] = []

    if (filters.tenant_id) {
      whereConditions.push(eq(Credit.tenant_id, filters.tenant_id))
    }

    if (filters.user_id) {
      whereConditions.push(eq(Credit.user_id, filters.user_id))
    }

    if (filters.type) {
      whereConditions.push(eq(Credit.type, filters.type))
    }

    if (filters.q) {
      const q = or(like(Credit.type, `%${filters.q}%`), like(Credit.object_id, `%${filters.q}%`))
      if (q) {
        whereConditions.push(q)
      }
    }

    const items: CreditWithDetailsDto[] = await drizzleDb.query.Credit.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        tenant: {
          columns: { name: true },
        },
        user: {
          columns: { email: true },
        },
      },
      limit: pagination.page_size,
      offset: pagination.page_size * (pagination.page - 1),
      orderBy: [desc(Credit.created_at)],
    })

    const totalItems = (
      await drizzleDb
        .select({ count: count() })
        .from(Credit)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    )[0].count

    return {
      items,
      pagination: {
        page: pagination.page,
        page_size: pagination.page_size,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.page_size),
      },
    }
  }

  async create(data: {
    tenant_id: string
    user_id: string | null
    type: string
    object_id: string | null
    amount: number
  }): Promise<string> {
    const id = createId()
    await drizzleDb.insert(Credit).values({
      id,
      created_at: new Date(),
      tenant_id: data.tenant_id,
      user_id: data.user_id,
      type: data.type,
      object_id: data.object_id,
      amount: data.amount,
    })
    return id
  }
  async sumAmount(filters: {
    tenant_id: string
    created_at?: { gte: Date; lt: Date }
  }): Promise<number> {
    let conditions = [eq(Credit.tenant_id, filters.tenant_id)]

    if (filters.created_at) {
      conditions.push(gte(Credit.created_at, filters.created_at.gte))
      conditions.push(lt(Credit.created_at, filters.created_at.lt))
    }

    const result = await drizzleDb
      .select({ sum: sum(Credit.amount).as('sum') })
      .from(Credit)
      .where(and(...conditions))

    // Explicitly cast the result to a number
    const sumValue = result[0]?.sum
    return sumValue ? Number(sumValue) : 0
  }
}
