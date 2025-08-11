import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const LIST_URL =
  "https://portail.marchespublics.nc/?page=Entreprise.EntrepriseAdvancedSearch&AllCons";

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(url: string, init: RequestInit & { timeoutMs?: number }, tries = 3) {
  let lastErr: any;
  for (let i = 1; i <= tries; i++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), init.timeoutMs ?? 25000);
    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(t);
      if (!res.ok && res.status >= 500 && i < tries) {
        await sleep(400 * i);
        continue;
      }
      return res;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (i < tries) { await sleep(600 * i); continue; }
      throw e;
    }
  }
  throw lastErr;
}

export async function GET(req: Request) {
  // sécurité simple: même clé que INGEST_SECRET
  const key = req.headers.get("x-proxy-key");
  if (!process.env.INGEST_SECRET || key !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const org = searchParams.get("org");

  if (!id || !org) {
    return NextResponse.json({ error: "Missing id or org" }, { status: 400 });
  }

  const upstream = `https://portail.marchespublics.nc/entreprise/consultation/${id}?orgAcronyme=${org}`;

  try {
    const res = await fetchWithRetry(
      upstream,
      {
        method: "GET",
        timeoutMs: 25000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9",
          "Referer": LIST_URL,
        },
      },
      3
    );

    const html = await res.text();
    return new NextResponse(html, {
      status: res.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Upstream fetch failed", detail: e?.message || String(e) },
      { status: 502 }
    );
  }
}
