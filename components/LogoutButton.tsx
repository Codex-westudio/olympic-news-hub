"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/database";

export function LogoutButton() {
  const supabase = createClientComponentClient<Database>();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-slate-300 px-4 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
    >
      Se déconnecter
    </button>
  );
}
