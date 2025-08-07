"server-only";

import { headers } from "next/headers";

export const getBaseURL = async () => {
  const heads = await headers();
  const url = heads.get("x-forwarded-host");
  if (url) {
    let protocol = heads.get("x-forwarded-proto") || "http";
    return `${protocol}://${url}`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

export const getDomainName = async () => {
  const baseUrl = await getBaseURL();
  const url = new URL(baseUrl);
  return url.host;
};

export const getCurrentUrl = async () => {
  const heads = await headers();
  return heads.get("x-url")?.toLowerCase() || "/";
};

export const requireTenantSlug = async () => {
  const heads = await headers();
  const id = heads.get("x-tenant-slug");
  if (!id) {
    throw new Error("Tenant ID not found");
  }
  return id;
};
