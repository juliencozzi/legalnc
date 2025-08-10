import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

type DocItem = { url: string; mime?: string | null };

export async function POST(req: Request) {
  const key = req.headers.get("x-ingest-key");
  if (!process.env.INGEST_SECRET || key !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const tenderId = body?.tenderId as string | undefined;
  const docs = (body?.docs ?? []) as DocItem[];

  if (!tenderId || !Array.isArray(docs) || docs.length === 0) {
    return NextResponse.json({ error: "Missing tenderId or docs" }, { status: 400 });
  }

  const supa = createSupabaseAdmin();
  const payload = docs.map(d => ({
    tender_id: tenderId,
    url: String(d.url),
    mime: d.mime ?? null,
    status: "queued",
  }));

  const { data, error } = await supa
    .from("tender_docs")
    .upsert(payload, { onConflict: "tender_id,url", ignoreDuplicates: false })
    .select("id");

  if (error) {
    console.error("ingest tender-docs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ upserted: data?.length ?? 0 });
}
