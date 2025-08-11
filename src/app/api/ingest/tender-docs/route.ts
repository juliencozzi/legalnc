import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

type DocItem = { url: string; mime?: string | null; kind?: string | null };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function POST(req: Request) {
  const key = req.headers.get("x-ingest-key");
  if (!process.env.INGEST_SECRET || key !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  let tenderId = body?.tenderId as string | undefined;
  const source = body?.source as string | undefined;
  const ref = body?.ref as string | undefined;
  const docs = (body?.docs ?? []) as DocItem[];

  if ((!tenderId && !(source && ref)) || !Array.isArray(docs) || docs.length === 0) {
    return NextResponse.json({ error: "Missing tenderId or (source,ref) or docs" }, { status: 400 });
  }

  const supa = createSupabaseAdmin();

  // Résolution par (source,ref) si tenderId non fourni
  if (!tenderId && source && ref) {
    const { data: found, error: e0 } = await supa
      .from("tenders")
      .select("id")
      .eq("source", source)
      .eq("ref", ref)
      .limit(1)
      .maybeSingle();

    if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });
    if (!found) return NextResponse.json({ error: "Tender not found for given (source,ref)" }, { status: 404 });
    tenderId = found.id as string;
  }

  const payload = docs.map(d => ({
    tender_id: tenderId!,
    url: String(d.url),
    mime: d.mime ?? null,
    kind: d.kind ?? null,
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

  return NextResponse.json({ upserted: data?.length ?? 0, tenderId });
}
