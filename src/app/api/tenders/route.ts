import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return NextResponse.json({ error: "Unauthorized (missing Bearer token)" }, { status: 401 });
  }
  const accessToken = match[1];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);
  const orderBy = url.searchParams.get("orderBy") || "deadline_at";
  const orderDir = (url.searchParams.get("orderDir") || "asc").toLowerCase() === "desc" ? "desc" : "asc";

  let query = supabase.from("tenders")
    .select("id, source, ref, buyer, title, category, amount_min, amount_max, deadline_at, url, created_at", { count: "exact" });

  if (q) {
    query = query.or(`title.ilike.%${q}%,buyer.ilike.%${q}%,ref.ilike.%${q}%`);
  }

  query = query.order(orderBy as any, { ascending: orderDir === "asc", nullsFirst: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [], count: count ?? 0, limit, offset });
}
