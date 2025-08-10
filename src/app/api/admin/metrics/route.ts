import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
export async function GET(req: Request) {
  const key = req.headers.get("x-admin-key");
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supa = createSupabaseAdmin();
  const [tendersCount, orgsCount, usersCount, paymentsLast48h] = await Promise.all([
    supa.from("tenders").select("*", { count: "exact", head: true }),
    supa.from("orgs").select("*", { count: "exact", head: true }),
    supa.auth.admin.listUsers({ page: 1, perPage: 1 }),
    supa.from("payments").select("id", { count: "exact", head: true })
      .gte("occurred_at", new Date(Date.now()_
