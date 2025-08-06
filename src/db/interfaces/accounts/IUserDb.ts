import { UserModel, UserDto, UserWithDetailsDto } from '../../models'
import { PaginationDto, SortedByDto } from '@/lib/dtos/PaginationDto'

export interface IUserDb {
  getAllWhereTenant(tenant_id: string): Promise<UserWithDetailsDto[]>
  getAllWithPagination(params: {
    filters: {
      email?: string
      first_name?: string
      last_name?: string
      tenant_id?: string | null
      admin?: boolean
    }
    pagination: { page: number; page_size: number; sortedBy?: SortedByDto[] }
  }): Promise<{ items: UserWithDetailsDto[]; pagination: PaginationDto }>
  getAll(): Promise<UserWithDetailsDto[]>
  get(user_id: string): Promise<UserDto | null>
  getByEmail(email: string): Promise<UserDto | null>
  getByEmailWithDetails(email: string): Promise<UserWithDetailsDto | null>
  getPasswordHash(id: string): Promise<string | null>
  getVerifyToken(id: string): Promise<string | null>
  count(): Promise<number>
  create(data: Omit<UserModel, 'id' | 'created_at' | 'updated_at'>): Promise<string>
  update(
    id: string,
    data: {
      first_name?: string
      last_name?: string
      avatar?: string | null
      locale?: string | null
      verify_token?: string | null
      hash?: string
      default_tenant_id?: string | null
      admin?: boolean
    },
  ): Promise<void>
  del(id: string): Promise<void>
  deleteAll(): Promise<void>
}
