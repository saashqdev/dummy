import { Colors } from '@/lib/colors'
import SimpleBadge from '@/components/ui/badges/SimpleBadge'
import LockClosedIcon from '@/components/ui/icons/LockClosedIcon'
import { RoleModel, PermissionModel } from '@/db/models'

interface Props {
  item: RoleModel | PermissionModel
  color?: Colors
}
export default function RoleBadge({ item, color = Colors.INDIGO }: Props) {
  return (
    <div className="flex items-center space-x-1">
      <div>{item.name}</div>
      {item.is_default && <LockClosedIcon className="h-3 w-3 text-gray-300" />}
      {item.type === 'admin' && <SimpleBadge title={'Admin'} color={color} />}
    </div>
  )
}
