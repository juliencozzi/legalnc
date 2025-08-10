"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type Tender = {
  id: string;
  ref: string;
  buyer: string;
  title: string;
  deadline_at: string | null;
  url: string | null;
};

export default function TendersPage() {
  const [items, setItems] = useState<Tender[]>([]);
  const [q, setQ] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function load() {
    setLoading(true);
    setErr(null);
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setErr("Veuillez vous connecter pour voir les annonces.");
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const res = await fetch(`/api/tenders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erreur");
      setItems(json.items || []);
    } catch (e: any) {
      setErr(e?.message || "Erreur");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold">Annonces</h1>
      <p className="mt-1 text-slate-600">Résultats visibles après connexion.</p>

      <div className="mt-6 flex gap-2">
        <input
          placeholder="Rechercher par titre/acheteur/référence…"
          className="w-full rounded-xl border px-3 py-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load} className="rounded-xl bg-black px-4 py-2 text-white">Rechercher</button>
      </div>

      {loading && <div className="mt-6 text-slate-500">Chargement…</div>}
      {err && <div className="mt-6 rounded-xl border bg-red-50 p-4 text-red-700">{err}</div>}

      {!loading && !err && (
        <div className="mt-6 grid gap-4">
          {items.map((t) => (
            <a key={t.id} href={t.url || "#"} target="_blank" rel="noreferrer" className="rounded-2xl border bg-white p-5 shadow-soft hover:shadow">
              <div className="text-xs text-slate-500">{t.ref} — {t.buyer}</div>
              <div className="mt-1 text-lg font-semibold">{t.title}</div>
              {t.deadline_at && <div className="text-xs text-slate-500 mt-1">Limite: {new Date(t.deadline_at).toLocaleDateString()}</div>}
            </a>
          ))}
          {items.length === 0 && <div className="text-slate-500">Aucune annonce.</div>}
        </div>
      )}
    </div>
  );
}
