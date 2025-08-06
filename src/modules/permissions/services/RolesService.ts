import { RoleModel, UserDto } from "@/db/models";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { updateUser } from "@/modules/accounts/services/UserService";
import { db } from "@/db";
import { createUserRoles } from "./UserRolesService";

export async function setUserRoles({
  user,
  roles,
  isAdmin,
  type,
}: {
  user: UserDto;
  roles: { role: RoleModel; tenantId: string | null }[];
  isAdmin: boolean;
  type: "admin" | "app";
}) {
  if (user.admin && !isAdmin) {
    await updateUser(user.id, { admin: false });
  } else if (!user.admin && isAdmin) {
    await updateUser(user.id, { admin: true });
  }

  await db.userRole.deleteAllByUser(user.id, type);
  await createUserRoles(
    user.id,
    roles.map(({ role, tenantId }) => ({
      id: role.id,
      tenantId,
    }))
  ).then(() => {
    clearCacheKey(`user:${user.id}`);
    clearCacheKey(`userRoles:${user.id}:${null}`);
  });
}

export async function getAllRolesWithoutPermissions(type?: "admin" | "app"): Promise<RoleModel[]> {
  return await cachified({
    key: `roles:${type}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.role.getAllWithoutPermissions(type),
  });
}

export async function createRole(data: {
  order: number;
  name: string;
  description: string;
  type: "admin" | "app";
  assignToNewUsers: boolean;
  isDefault: boolean;
}) {
  return await db.role.create(data).then((item) => {
    clearCacheKey(`roles:${data.type}`);
    return item;
  });
}

export async function updateRole(id: string, data: { name: string; description: string; type: "admin" | "app"; assignToNewUsers: boolean }) {
  const item = await db.role.get(id);
  await db.role.update(id, data).then(() => {
    clearCacheKey(`roles:${data.type}`);
    clearCacheKey(`roles:${item?.type}`);
  });
}

export async function deleteRole(id: string) {
  const item = await db.role.get(id);
  return await db.role.del(id).then(() => {
    clearCacheKey(`roles:${item?.type}`);
  });
}
