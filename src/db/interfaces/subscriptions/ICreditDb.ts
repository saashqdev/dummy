import { PaginationDto } from '@/lib/dtos/PaginationDto'
import { CreditWithDetailsDto } from '../../models'

export interface ICreditDb {
  getAllWithPagination({
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
  }): Promise<{ items: CreditWithDetailsDto[]; pagination: PaginationDto }>
  create(data: {
    tenant_id: string
    user_id: string | null
    type: string
    object_id: string | null
    amount: number
  }): Promise<string>
  sumAmount(filters: { tenant_id: string; created_at?: { gte: Date; lt: Date } }): Promise<number>
}
