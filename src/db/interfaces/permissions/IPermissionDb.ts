import { PermissionDto, PermissionWithRolesDto } from '../../models'

export interface IPermissionDb {
  getAll(filters?: { type?: string; role_id?: string | null }): Promise<PermissionWithRolesDto[]>
  getAllIdsAndNames(): Promise<PermissionDto[]>
  get(id: string): Promise<PermissionWithRolesDto | null>
  getByName(name: string): Promise<PermissionDto | null>
  getMaxOrder(type: 'admin' | 'app'): Promise<number>
  create(data: {
    order: number
    name: string
    description: string
    type: string
    is_default: boolean
  }): Promise<string>
  update(
    id: string,
    data: {
      name?: string
      description?: string
      type?: string
      order?: number
    },
  ): Promise<void>
  del(id: string): Promise<void>
}
