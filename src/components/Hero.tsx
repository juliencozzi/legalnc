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
