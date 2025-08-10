"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/supabase-js";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  async function signin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErr(error.message); return; }
    setMsg("Connecté ! Vous pouvez ouvrir /tenders");
  }

  async function signout() {
    await supabase.auth.signOut();
    setMsg("Déconnecté");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Connexion</h1>
      <p className="mt-1 text-slate-600">Utilisez un utilisateur créé dans Supabase Auth.</p>

      <form onSubmit={signin} className="mt-6 space-y-4">
        <input className="w-full rounded-xl border px-3 py-2" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full rounded-xl border px-3 py-2" placeholder="mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="rounded-xl bg-black px-4 py-2 text-white">Se connecter</button>
      </form>

      <div className="mt-4 flex gap-2">
        <a href="/tenders" className="rounded-xl border px-4 py-2">Voir les annonces</a>
        <button onClick={signout} className="rounded-xl border px-4 py-2">Se déconnecter</button>
      </div>

      {msg && <div className="mt-4 rounded-xl border bg-green-50 p-3 text-green-700">{msg}</div>}
      {err && <div className="mt-4 rounded-xl border bg-red-50 p-3 text-red-700">{err}</div>}
    </div>
  );
}
