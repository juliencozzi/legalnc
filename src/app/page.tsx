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
