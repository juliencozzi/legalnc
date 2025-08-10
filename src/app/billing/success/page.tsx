export default function BillingSuccess() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">Paiement confirmé ✅</h1>
      <p className="mt-2 text-slate-600">Votre abonnement est activé. Merci !</p>
      <a href="/dashboard" className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-white">
        Ouvrir le tableau de bord
      </a>
    </div>
  );
}
