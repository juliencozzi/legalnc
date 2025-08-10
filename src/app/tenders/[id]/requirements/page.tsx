"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

type Req = { id: string; type: string; label: string; source_excerpt?: string | null };

export default function TenderRequirementsPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<Req[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) { setErr("Veuillez vous connecter."); setLoading(false); return; }
    try {
      const res = await fetch(`/api/tenders/${params.id}/requirements`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erreur");
      setItems(json.items || []);
    } catch (e: any) {
      setErr(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exigences — Appel d’offres</h1>
        <Link href="/tenders" className="rounded-xl border px-3 py-2">← Retour</Link>
      </div>

      {loading && <div className="text-slate-500">Chargement…</div>}
      {err && <div className="rounded-xl border bg-red-50 p-4 text-red-700">{err}</div>}

      {!loading && !err && (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl border bg-white p-4 shadow-soft">
              <div className="font-medium">{r.label}</div>
              {r.source_excerpt && <div className="mt-1 text-xs text-slate-500">Extrait : {r.source_excerpt}</div>}
              <div className="mt-1 text-xs text-slate-400 uppercase">{r.type}</div>
            </li>
          ))}
          {items.length === 0 && <div className="text-slate-500">Aucune exigence détectée pour le moment.</div>}
        </ul>
      )}
    </div>
  );
}
