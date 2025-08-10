import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * GET /api/admin/metrics
 * Header: x-admin-key: <ADMIN_API_KEY>
 * Returns aggregate metrics for dashboard.
 */
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
    supa
      .from("payments")
      .select("id, status", { count: "exact", head: true })
      .gte("occurred_at", new Date(Date.now() - 48 * 3600 * 1000).toISOString()),
  ]);

  const usersTotal = usersCount?.data?.users?.length
    ? usersCount.data.users.length
    : (usersCount as any)?.data?.total ?? 0;

  return NextResponse.json({
    tenders: tendersCount.count ?? 0,
    orgs: orgsCount.count ?? 0,
    users: usersTotal,
    paymentsLast48h: paymentsLast48h.count ?? 0,
    generatedAt: new Date().toISOString(),
  });
}
