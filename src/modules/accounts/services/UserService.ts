import { getTenant } from "@/modules/accounts/services/TenantService";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import bcrypt from "bcryptjs";
import { db } from "@/db";

export async function getUser(userId: string | undefined) {
  if (!userId) {
    return null;
  }
  return await cachified({
    key: `user:${userId}`,
    ttl: 1000 * 60 * 60 * 24, // 1 day
    getFreshValue: async () => db.user.get(userId),
  });
}

export async function getDefaultTenant(user: { id: string; defaultTenantId: string | null; admin?: boolean }) {
  if (user.admin) {
    return null;
  }
  if (user.defaultTenantId) {
    const tenant = await getTenant(user.defaultTenantId);
    return tenant;
  }
  const userTenants = await db.tenant.getByUser(user.id);
  if (userTenants.length > 0) {
    return userTenants[0];
  }
  return null;
}

export async function createUser(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  active?: boolean;
  avatar?: string | null;
  locale?: string | null;
  defaultTenantId?: string | null;
}) {
  const { email, password, firstName, lastName, active, avatar, locale, defaultTenantId } = data;
  const passwordHash = password ? await bcrypt.hash(password, 10) : "";
  const id = await db.user.create({
    email,
    passwordHash,
    firstName: firstName || "",
    lastName: lastName || "",
    avatar: avatar || null,
    locale: locale || null,
    defaultTenantId: defaultTenantId || null,
    active: active !== undefined ? active : true,
    phone: null,
    admin: false,
    verifyToken: null,
  });
  const user = await getUser(id);
  if (!user) {
    throw new Error("Could not create user");
  }
  return user;
}

export async function updateUser(
  id: string,
  data: {
    passwordHash?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
    defaultTenantId?: string;
    verifyToken?: string;
    locale?: string;
    admin?: boolean;
  }
) {
  if (!id) {
    return null;
  }
  return await db.user
    .update(id, {
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
      locale: data.locale,
      verifyToken: data.verifyToken,
      passwordHash: data.passwordHash,
      defaultTenantId: data.defaultTenantId,
      admin: data.admin,
    })
    .then((item) => {
      clearCacheKey(`user:${id}`);
      return item;
    });
}

export async function deleteUser(id: string): Promise<void> {
  await db.user.del(id).then((item) => {
    clearCacheKey(`user:${id}`);
    return item;
  });
}
