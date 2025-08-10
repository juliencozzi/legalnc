import "@/styles/globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Pilot NC — Copilot Appels d’Offres NC",
  description: "Veille locale, check-list conformité, trames prêtes à signer. ePayNC & Signature.nc.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <Link href="/" className="font-semibold">Pilot NC</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/dashboard">Tableau de bord</Link>
              <Link href="/pricing">Tarifs</Link>
              <a href="/signup" className="rounded-xl bg-black px-4 py-2 text-white">Essayer</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t">
          <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-500">
            © {new Date().getFullYear()} Pilot NC — Nouvelle-Calédonie
          </div>
        </footer>
      </body>
    </html>
  );
}
