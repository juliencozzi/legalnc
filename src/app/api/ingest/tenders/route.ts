import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

type Tender = {
  source: string;
  ref: string;
  buyer: string;
  title: string;
  category?: string | null;
  amount_min?: number | null;
  amount_max?: number | null;
  deadline_at?: string | null; // ISO
  url?: string | null;
  raw_json?: any;
};

/**
 * Secret-protected ingest endpoint.
 * Header: x-ingest-key: process.env.INGEST_SECRET
 * Body: { items: Tender[] }
 */
export async function POST(req: Request) {
  const key = req.headers.get("x-ingest-key");
  if (!process.env.INGEST_SECRET || key !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supa = createSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const items = (body?.items ?? []) as Tender[];

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  const payload = items.map((t) => ({
    source: String(t.source || "unknown"),
    ref: String(t.ref || ""),
    buyer: String(t.buyer || ""),
    title: String(t.title || ""),
    category: t.category ?? null,
    amount_min: t.amount_min ?? null,
    amount_max: t.amount_max ?? null,
    deadline_at: t.deadline_at ?? null,
    url: t.url ?? null,
    raw_json: t.raw_json ?? null,
  }));

  const { data, error } = await supa
    .from("tenders")
    .upsert(payload, { onConflict: "source,ref", ignoreDuplicates: false })
    .select("id, source, ref");

  if (error) {
    console.error("Ingest upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: data?.length ?? 0 });
}
