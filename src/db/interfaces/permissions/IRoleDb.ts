import { RoleModel, RoleWithPermissionsAndUsersDto, RoleWithPermissionsDto } from '../../models'

export interface IRoleDb {
  getAll(type?: 'admin' | 'app'): Promise<RoleWithPermissionsDto[]>
  getAllNames(): Promise<{ id: string; name: string }[]>
  getAllWithoutPermissions(type?: 'admin' | 'app'): Promise<RoleModel[]>
  getAllWithUsers(filters?: {
    type?: 'admin' | 'app'
    permission_id?: string | null
  }): Promise<RoleWithPermissionsAndUsersDto[]>
  getAllInIds(ids: string[]): Promise<RoleWithPermissionsAndUsersDto[]>
  get(id: string): Promise<RoleWithPermissionsDto | null>
  getByName(name: string): Promise<RoleWithPermissionsDto | null>
  getMaxOrder(type?: 'admin' | 'app'): Promise<number>
  create(data: {
    order: number
    name: string
    description: string
    type: 'admin' | 'app'
    assign_to_new_users: boolean
    is_default: boolean
  }): Promise<string>
  update(
    id: string,
    data: {
      name: string
      description: string
      type: 'admin' | 'app'
      assign_to_new_users: boolean
    },
  ): Promise<void>
  del(id: string): Promise<void>
}
