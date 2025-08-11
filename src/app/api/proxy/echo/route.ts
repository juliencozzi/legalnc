export const dynamic = 'force-dynamic';

export async function GET() {
  const seen = process.env.PROXY_KEY ? 'set' : 'missing';
  return Response.json({ ok: true, env: seen });
}
