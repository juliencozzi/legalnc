type Stat = { label: string; value: string; sub?: string };
const STATS: Stat[] = [
  { label: "Annonces ingérées (30j)", value: "1 248", sub: "+12% vs 30j" },
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
