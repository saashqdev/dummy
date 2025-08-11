import { redirect } from "next/navigation";

export async function GET() {
  redirect("/admin/settings/general");
}
