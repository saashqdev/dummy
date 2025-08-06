import { TenantDto, TenantWithDetailsDto } from '../../models'
import { PaginationDto, PaginationRequestDto } from '@/lib/dtos/PaginationDto'

export interface ITenantDb {
  getAll(): Promise<TenantWithDetailsDto[]>
  getAllIdsAndNames(): Promise<{ id: string; name: string; slug: string }[]>
  getAllWithPagination(params: {
    filters?: { name?: string; slug?: string; active?: boolean }
    pagination: PaginationRequestDto
  }): Promise<{ items: TenantWithDetailsDto[]; pagination: PaginationDto }>
  getByUser(user_id: string): Promise<TenantDto[]>
  get(id: string): Promise<TenantWithDetailsDto | null>
  getSimple(id: string): Promise<TenantDto | null>
  getByIdOrSlug(id: string): Promise<TenantDto | null>
  getIdByIdOrSlug(tenant: string | undefined): Promise<string | null>
  count(): Promise<number>
  countCreatedSince(since: Date | undefined): Promise<number>
  countBySlug(slug: string): Promise<number>
  create({
    slug,
    name,
    icon,
    active,
  }: {
    slug: string
    name: string
    icon: string | null
    active: boolean
  }): Promise<string>
  update(id: string, data: { name?: string; icon?: string; slug?: string }): Promise<void>
  del(id: string): Promise<void>
  deleteAll(): Promise<void>
}
