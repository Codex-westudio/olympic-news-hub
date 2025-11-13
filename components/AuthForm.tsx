"use client";

import { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

import type { Database } from "@/types/database";

export function AuthForm() {
  const supabase = useSupabaseClient<Database>();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Envoi du lien magique…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Vérifie ta boîte mail 👀");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setStatus("Déconnecté");
  };

  if (session?.user) {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Connecté en tant que <span className="font-medium">{session.user.email}</span>
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full bg-midnight px-5 py-2 text-sm font-semibold text-white"
        >
          Se déconnecter
        </button>
        {status && <p className="text-xs text-slate-500">{status}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSignIn}
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-base text-slate-900 outline-none focus:border-midnight"
        />
      </label>
      <p className="text-xs text-slate-500">
        Nous utilisons un lien magique. Aucune clé secrète n’est exposée côté client.
      </p>
      <button
        type="submit"
        className="w-full rounded-full bg-midnight px-5 py-2 text-sm font-semibold text-white"
      >
        Recevoir le lien
      </button>
      {status && <p className="text-xs text-slate-500">{status}</p>}
    </form>
  );
}
