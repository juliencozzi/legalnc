"use client";
import { useState } from "react";

const PLANS = [
  { code: "FREE", name: "Essai", price: 0, period: "mois", features: ["5 opportunités suivies", "Alertes quotidiennes", "1 export dossier"] },
  { code: "PRO", name: "Pro", price: 5900, period: "mois", features: ["50 opportunités", "Alertes quot. + hebdo", "Exports illimités", "Check-list conformité"] },
  { code: "PRO_PLUS", name: "Pro+", price: 12900, period: "mois", features: ["Illimité", "Relances J-7/J-3/J-1", "Signatures intégrées", "Support prioritaire"] },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>("demo-org");

  async function subscribe(planCode: string) {
    setLoading(planCode);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, planCode }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur de redirection paiement");
      }
    } catch (e: any) {
      alert(e?.message || "Erreur inattendue");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-3xl font-bold">Tarifs</h1>
      <p className="mt-2 text-slate-600">Choisissez un plan. Paiement sécurisé via ePayNC.</p>

      <div className="mt-8 mb-4">
        <label className="text-sm">Organisation</label>
        <input
          className="mt-1 w-full max-w-md rounded-xl border px-3 py-2"
          placeholder="ID organisation (temporaire)"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">En V1, entrez votre orgId. L’auth/détection auto arrive ensuite.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.code} className="rounded-2xl border bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold">{p.name}</div>
            <div className="mt-2 text-3xl font-extrabold">
              {p.price === 0 ? "Gratuit" : `${(p.price / 100).toFixed(0)}00 XPF`}
              <span className="text-sm font-medium text-slate-500"> / {p.period}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {p.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <button
              className="mt-6 w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
              disabled={loading === p.code}
              onClick={() => subscribe(p.code)}
            >
              {loading === p.code ? "Redirection..." : "Choisir"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
