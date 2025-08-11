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
  deadline_at?: string | null;
  url?: string | null;
  raw_json?: any;
};

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
    source: String(t.source || "portail.marchespublics.nc"),
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

  // ← n8n a besoin de l'id pour la suite
  return NextResponse.json({ items: data ?? [] });
}
