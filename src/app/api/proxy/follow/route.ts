import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") || "";
  const key = req.headers.get("x-proxy-key") || "";
  return Response.json({ seenKey: key, matches: key === (process.env.PROXY_KEY ?? '') });

  if (!key || key !== process.env.INGEST_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // sécurise: on ne suit que portail.marchespublics.nc
    const u = new URL(url);
    if (u.hostname !== "portail.marchespublics.nc") {
      return NextResponse.json({ error: "forbidden host" }, { status: 400 });
    }

    const r = await fetch(u.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9",
        "Referer": "https://portail.marchespublics.nc/",
      },
      // important sur vercel pour suivre 30x
      redirect: "follow",
      cache: "no-store",
    });

    const html = await r.text();
    return new NextResponse(html, {
      status: r.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "proxy error" }, { status: 502 });
  }
}
