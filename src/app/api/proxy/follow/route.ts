export const dynamic = 'force-dynamic';

function bad(status: number, message: string) {
  return new Response(JSON.stringify({ error: { status, message } }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get('url') || '';
  const key = req.headers.get('x-proxy-key') || '';

  if (!process.env.PROXY_KEY) return bad(500, 'Missing PROXY_KEY on server');
  if (key !== process.env.PROXY_KEY) return bad(401, 'unauthorized');
  if (!target) return bad(400, 'Missing ?url=');

  // headers utiles pour le site cible
  const ua =
    req.headers.get('user-agent') ||
    'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari';
  const ref = req.headers.get('referer') || undefined;

  try {
    const r = await fetch(target, {
      // App Router: désactive le cache pour éviter un 404 mémorisé
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'User-Agent': ua,
        ...(ref ? { Referer: ref } : {}),
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    // renvoie tel quel (contenu + content-type)
    const ct = r.headers.get('content-type') || 'text/html; charset=utf-8';
    const body = await r.arrayBuffer(); // évite les soucis d’encodage
    return new Response(body, {
      status: r.status,
      headers: { 'content-type': ct },
    });
  } catch (e: any) {
    return bad(502, e?.message || 'fetch failed');
  }
}
