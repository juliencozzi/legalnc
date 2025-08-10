"use client";
import { useEffect, useState } from "react";

type Metrics = {
  tenders: number;
  orgs: number;
  users: number;
  paymentsLast48h: number;
  generatedAt: string;
};

export default function AdminPage() {
  const [m, setM] = useState<Metrics | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [key, setKey] = useState<string>("");

  useEffect(() => {
    const k = localStorage.getItem("adminKey") || "";
    if (k) {
      setKey(k);
      fetchMetrics(k);
    }
  }, []);

  async function fetchMetrics(k: string) {
    try {
      const res = await fetch("/api/admin/metrics", {
        headers: { "x-admin-key": k },
      });
      if (!res.ok) {
        setErr("Accès refusé. Vérifiez ADMIN_API_KEY.");
        setM(null);
        return;
      }
      const data = await res.json();
      setM(data);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || "Erreur inattendue");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold">Admin — Dashboard</h1>
      <p className="mt-1 text-slate-600">Suivi des annonces, comptes et paiements.</p>

      <div className="mt-6 rounded-2xl border bg-white p-6">
        <label className="text-sm">Clé d’accès admin (temporaire)</label>
        <div className="mt-2 flex gap-2">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="ADMIN_API_KEY"
            className="w-full rounded-xl border px-3 py-2"
          />
          <button
            onClick={() => {
              localStorage.setItem("adminKey", key);
              fetchMetrics(key);
            }}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            Charger
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Pour la V1, l’accès est protégé par une clé simple côté serveur. À remplacer par un vrai contrôle de rôles.
        </p>
      </div>

      {err && <div className="mt-6 rounded-xl border bg-red-50 p-4 text-red-700">{err}</div>}

      {m && (
        <div className="mt-6 grid gap-6 sm:grid-cols-4">
          {[
            ["Annonces (total)", m.tenders],
            ["Organisations", m.orgs],
            ["Utilisateurs", m.users],
            ["Paiements (48h)", m.paymentsLast48h],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl border bg-white p-5 shadow-soft">
              <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
              <div className="mt-2 text-2xl font-bold">{value as number}</div>
            </div>
          ))}
          <div className="sm:col-span-4 text-right text-xs text-slate-500">
            Mis à jour: {new Date(m.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
