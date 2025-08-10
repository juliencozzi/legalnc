export default function BillingCancel() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">Paiement annulé ⛔</h1>
      <p className="mt-2 text-slate-600">Vous pouvez réessayer à tout moment depuis la page Tarifs.</p>
      <a href="/pricing" className="mt-6 inline-block rounded-xl bg-white px-5 py-3 border">Retour aux tarifs</a>
    </div>
  );
}
