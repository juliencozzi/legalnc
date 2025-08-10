import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

async function bufferFromArrayBuffer(ab: ArrayBuffer) {
  return Buffer.from(new Uint8Array(ab));
}

async function extractTextFromPdf(buf: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default as any;
  const res = await pdfParse(buf);
  return (res?.text || "").toString();
}

async function extractTextFromDocx(buf: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const res = await mammoth.extractRawText({ buffer: buf as any });
  return (res?.value || "").toString();
}

function detectMimeFromUrl(url: string): string {
  const u = url.toLowerCase();
  if (u.endsWith(".pdf")) return "application/pdf";
  if (u.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (u.endsWith(".doc")) return "application/msword";
  return "application/octet-stream";
}

function extractRequirementsHeuristic(text: string) {
  const lowered = text.toLowerCase();
  const out:any[] = [];
  const push = (label:string, pattern:RegExp) => {
    const m = text.match(pattern);
    const excerpt = m ? text.substring(Math.max(0, m.index! - 60), Math.min(text.length, m.index! + 120)).replace(/\s+/g, " ").trim() : undefined;
    out.push({ type: "document", label, source_excerpt: excerpt });
  };
  if (/\bdc1\b/.test(lowered)) push("Formulaire DC1 (lettre de candidature)", /dc1/i);
  if (/\bdc2\b/.test(lowered)) push("Formulaire DC2 (déclaration du candidat)", /dc2/i);
  if (/attestation(s)? (sociale|fiscale)/.test(lowered)) push("Attestations sociale et fiscale à jour", /attestation[^\n]{0,80}(sociale|fiscale)/i);
  if (/k[-\s]?bis/.test(lowered) || /registre du commerce/.test(lowered)) push("Extrait K-bis / Registre du commerce", /(k[-\s]?bis|registre du commerce)/i);
  if (/responsabilit[eé] civile/.test(lowered)) push("Attestation assurance responsabilité civile", /responsabilit[eé] civile/i);
  if (/capacit[eé]s? (techniques|financi[eè]res)/.test(lowered)) push("Capacités techniques et financières", /capacit[eé]s? (techniques|financi[eè]res)/i);
  if (/r[eé]f[eé]rences/.test(lowered)) push("Références similaires", /r[eé]f[eé]rences/i);
  if (/moyens (humains|mat[eé]riels)/.test(lowered)) push("Moyens humains et matériels", /moyens (humains|mat[eé]riels)/i);
  if (/visite (pr[eé]alable|obligatoire)/.test(lowered)) push("Visite obligatoire", /visite (pr[eé]alable|obligatoire)/i);
  if (/validit[eé] de l['’]offre/.test(lowered)) push("Validité de l’offre", /validit[eé] de l.?offre/i);
  if (/d[eé]lai(s)? d['’]ex[eé]cution/.test(lowered)) push("Délais d’exécution", /d[eé]lai[s]? d.?ex[eé]cution/i);
  if (/caution|garantie de bonne ex[eé]cution/.test(lowered)) push("Caution/garantie de bonne exécution", /(caution|garantie de bonne ex[eé]cution)/i);
  if (/crit[eè]res? d['’]attribution/.test(lowered)) push("Critères d’attribution", /crit[eè]res? d.?attribution/i);
  // dedupe by label
  const uniq = new Map();
  for (const r of out) if (!uniq.has(r.label)) uniq.set(r.label, r);
  return Array.from(uniq.values());
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const key = req.headers.get("x-parse-key") || req.headers.get("x-ingest-key");
  if (!process.env.INGEST_SECRET || key !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenderId = params.id;
  const supa = createSupabaseAdmin();

  const { data: docs, error: e1 } = await supa
    .from("tender_docs")
    .select("id, url, mime, status")
    .eq("tender_id", tenderId)
    .in("status", ["queued", "pending"]);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (!docs || docs.length === 0) return NextResponse.json({ parsed: 0, requirements: 0, message: "No docs to parse" });

  let parsedCount = 0;
  let fullText = "";

  for (const d of docs) {
    try {
      const res = await fetch(d.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ab = await res.arrayBuffer();
      const buf = await bufferFromArrayBuffer(ab);
      const mime = d.mime || res.headers.get("content-type") || detectMimeFromUrl(d.url);

      let text = "";
      if (mime.includes("pdf")) {
        text = await extractTextFromPdf(buf);
      } else if (mime.includes("word") || d.url.toLowerCase().endswith(".docx") || mime.includes("doc")) {
        text = await extractTextFromDocx(buf);
      } else {
        text = "";
      }

      fullText += "\n\n" + text;
      await supa.from("tender_docs").update({ status: "parsed", text }).eq("id", d.id);
      parsedCount++;
    } catch (err: any) {
      await supa.from("tender_docs").update({ status: "failed" }).eq("id", d.id);
      console.error("parse error", d.url, err?.message || err);
    }
  }

  const reqs = extractRequirementsHeuristic(fullText);
  if (reqs.length > 0) {
    const payload = reqs.map((r:any) => ({
      tender_id: tenderId,
      type: r.type,
      label: r.label,
      source_excerpt: r.source_excerpt ?? null,
    }));
    await supa.from("tender_requirements").delete().eq("tender_id", tenderId);
    const { error: e2 } = await supa.from("tender_requirements").insert(payload);
    if (e2) console.error("insert requirements error:", e2.message);
  }

  return NextResponse.json({ parsed: parsedCount, requirements: reqs.length });
}
