import payload from 'payload'
import { createId } from '@paralleldrive/cuid2'
import { and, count, desc, eq, gte, like, lt, or, SQL, sum } from 'drizzle-orm'
import { credit } from '@/db/schema'
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
    pagination: { pageSize: number; page: number }
  }): Promise<{ items: CreditWithDetailsDto[]; pagination: PaginationDto }> {
    let whereConditions: SQL[] = []

    if (filters.tenant_id) {
      whereConditions.push(eq(credit.tenant_id, filters.tenant_id))
    }

    if (filters.user_id) {
      whereConditions.push(eq(credit.user_id, filters.user_id))
    }

    if (filters.type) {
      whereConditions.push(eq(credit.type, filters.type))
    }

    if (filters.q) {
      const q = or(like(credit.type, `%${filters.q}%`), like(credit.object_id, `%${filters.q}%`))
      if (q) {
        whereConditions.push(q)
      }
    }

    const items: CreditWithDetailsDto[] = await payload.db.tables.credit.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        tenant: {
          columns: { name: true },
        },
        user: {
          columns: { email: true },
        },
      },
      limit: pagination.pageSize,
      offset: pagination.pageSize * (pagination.page - 1),
      orderBy: [desc(credit.created_at)],
    })

    const totalItems = (
      await payload.db.tables
        .select({ count: count() })
        .from(credit)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    )[0].count

    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    }
  }

  async create(data: {
    tenant_id: string
    userId: string | null
    type: string
    object_id: string | null
    amount: number
  }): Promise<string> {
    const id = createId()
    await payload.db.tables.insert(credit).values({
      id,
      created_at: new Date(),
      tenant_id: data.tenant_id,
      userId: data.user_id,
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
    let conditions = [eq(credit.tenant_id, filters.tenant_id)]

    if (filters.created_at) {
      conditions.push(gte(credit.created_at, filters.created_at.gte))
      conditions.push(lt(credit.created_at, filters.created_at.lt))
    }

    const result = await payload.db.tables
      .select({ sum: sum(credit.amount).as('sum') })
      .from(credit)
      .where(and(...conditions))

    // Explicitly cast the result to a number
    const sumValue = result[0]?.sum
    return sumValue ? Number(sumValue) : 0
  }
}
