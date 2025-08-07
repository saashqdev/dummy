import { resetUserSession } from "@/lib/services/session.server";
import { redirect } from "next/navigation";

export async function GET() {
  await resetUserSession();
  redirect("/login");
}
