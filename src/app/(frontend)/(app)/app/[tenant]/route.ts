import { requireTenantSlug } from "@/lib/services/url.server";
import { redirect } from "next/navigation";

export async function GET() {
  const tenantSlug = await requireTenantSlug();
  redirect(`/app/${tenantSlug}/dashboard`);
}
