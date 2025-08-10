#!/usr/bin/env bash
set -euo pipefail

echo "==> Fix next.config.mjs"
cat > next.config.mjs <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};
export default nextConfig;
EOF

echo "==> Maj .env.example (ADMIN_API_KEY si absent)"
grep -q '^ADMIN_API_KEY=' .env.example || echo 'ADMIN_API_KEY=change-me' >> .env.example

echo "==> Crée composants UI"
mkdir -p src/components
cat > src/components/Hero.tsx <<'EOF'
export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-slate-50" />
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
              Nouveau • Pilot NC
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              Répondez aux appels d’offres NC <span className="underline decoration-wavy">3× plus vite</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Veille locale, check-list conformité et trames prêtes à signer. Intégration ePayNC & Signature.nc.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="/signup" className="rounded-2xl px-5 py-3 text-white bg-black hover:opacity-90">Essayer gratuitement</a>
              <a href="/demo" className="rounded-2xl px-5 py-3 border">Voir une démo</a>
            </div>
            <p className="mt-3 text-xs text-slate-500">Essai 14 jours • Sans carte • FR/EN</p>
          </div>
          <div className="relative rounded-3xl border bg-white p-3 shadow-xl">
            <div className="aspect-[16/10] w-full rounded-2xl bg-slate-100 grid place-items-center text-slate-400">
              Aperçu produit
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
EOF

cat > src/components/StatsCards.tsx <<'EOF'
type Stat = { label: string; value: string; sub?: string };
const STATS: Stat[] = [
  { label: "Annonces ingérées (30j)", value: "1 248", sub: "+12% vs 30j" },
  { label: "Temps moyen gain", value: "−64%", sub: "préparation dossier" },
  { label: "Taux d’ouverture alertes", value: "72%", sub: "clients pilotes" },
];

export default function StatsCards() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-6 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-white p-5 shadow-soft">
            <div className="text-xs uppercase tracking-wide text-slate-500">{s.label}</div>
            <div className="mt-2 text-2xl font-bold">{s.value}</div>
            {s.sub && <div className="text-xs text-slate-500 mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
EOF

echo "==> Home (backup si existante) + contenu Hero"
mkdir -p src/app
if [ -f src/app/page.tsx ]; then
  mv src/app/page.tsx "src/app/page.backup.$(date +%s).tsx"
fi
cat > src/app/page.tsx <<'EOF'
import Hero from "@/components/Hero";
import StatsCards from "@/components/StatsCards";

export default function Page() {
  return (
    <>
      <Hero />
      <StatsCards />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Veille locale", "Collecte quotidienne des avis NC, dédoublonnage et normalisation."],
            ["Matching explicable", "Score 0–100 basé sur vos secteurs, montants, délais et mots-clés."],
            ["Dossiers prêts", "Trames mémoire + DC1/DC2 pré-remplies, prêtes à signer."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
EOF

echo "==> Admin API + client Supabase admin"
mkdir -p src/lib src/app/api/admin/metrics
cat > src/lib/supabaseAdmin.ts <<'EOF'
import { createClient } from "@supabase/supabase-js";
/** Server-side admin client (service role). Never expose this to the browser. */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Missing Supabase admin env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}
EOF

cat > src/app/api/admin/metrics/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
export async function GET(req: Request) {
  const key = req.headers.get("x-admin-key");
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supa = createSupabaseAdmin();
  const [tendersCount, orgsCount, usersCount, paymentsLast48h] = await Promise.all([
    supa.from("tenders").select("*", { count: "exact", head: true }),
    supa.from("orgs").select("*", { count: "exact", head: true }),
    supa.auth.admin.listUsers({ page: 1, perPage: 1 }),
    supa.from("payments").select("id", { count: "exact", head: true })
      .gte("occurred_at", new Date(Date.now()_
