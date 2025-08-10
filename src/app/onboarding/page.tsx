"use client";
import { useState } from "react";

export default function Onboarding() {
  const [sectors, setSectors] = useState<string>("Services, IT, BTP");
  const [keywords, setKeywords] = useState<string>("portail, logiciel, maintenance, réseaux");
  const [budgetMin, setBudgetMin] = useState<number>(0);
  const [budgetMax, setBudgetMax] = useState<number>(20000000);
  const [alerts, setAlerts] = useState<"daily" | "weekly">("daily");
  const [done, setDone] = useState<boolean>(false);

  async function submit() {
    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectors, keywords, budgetMin, budgetMax, alerts }),
    });
    if (res.ok) setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Bienvenue !</h1>
        <p className="mt-2 text-slate-600">Votre profil est enregistré. Les opportunités vont s’afficher selon vos critères.</p>
        <a href="/dashboard" className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-white">
          Ouvrir le tableau de bord
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold">Onboarding</h1>
      <p className="mt-2 text-slate-600">Dites-nous ce qui vous intéresse pour un matching précis.</p>

      <div className="mt-8 space-y-6">
        <div>
          <label className="text-sm">Secteurs (liste)</label>
          <input value={sectors} onChange={(e) => setSectors(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </div>

        <div>
          <label className="text-sm">Mots-clés (virgules)</label>
          <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Budget min (XPF)</label>
            <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(parseInt(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">Budget max (XPF)</label>
            <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(parseInt(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="text-sm">Fréquence d’alertes</label>
          <div className="mt-2 flex gap-3">
            <button onClick={() => setAlerts("daily")} className={`rounded-xl border px-4 py-2 ${alerts==="daily"?"bg-black text-white":"bg-white"}`}>Quotidienne</button>
            <button onClick={() => setAlerts("weekly")} className={`rounded-xl border px-4 py-2 ${alerts==="weekly"?"bg-black text-white":"bg-white"}`}>Hebdomadaire</button>
          </div>
        </div>

        <button onClick={submit} className="rounded-xl bg-black px-5 py-3 text-white">Valider</button>
      </div>
    </div>
  );
}
