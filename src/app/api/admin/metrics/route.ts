import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supa = createSupabaseAdmin();
  const sinceIso = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(); // 48h

  const [tendersRes, usersRes, paymentsRes] = await Promise.all([
    supa.from("tenders").select("id", { count: "exact", head: true }),
    supa.auth.admin.listUsers({ page: 1, perPage: 1 }),
    supa.from("payments")
        .select("id", { count: "exact", head: true })
        .gte("occurred_at", sinceIso),
  ]);

  if (tendersRes.error || paymentsRes.error) {
    const err = tendersRes.error || paymentsRes.error;
    return NextResponse.json({ error: err!.message }, { status: 500 });
  }

  // listUsers renvoie { users, total, ... } (total peut être undefined selon version)
  const totalUsers = (usersRes.data as any)?.total ?? (usersRes.data as any)?.users?.length ?? 0;

  return NextResponse.json({
    tenders: tendersRes.count ?? 0,
    users: totalUsers,
    payments_48h: paymentsRes.count ?? 0,
  });
}
