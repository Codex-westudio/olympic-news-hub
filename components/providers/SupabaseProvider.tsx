"use client";

import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

import type { Database } from "@/types/database";

interface SupabaseProviderProps {
  initialSession: Session | null;
  children: React.ReactNode;
}

export function SupabaseProvider({ initialSession, children }: SupabaseProviderProps) {
  const hasEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const [supabaseClient] = useState(() =>
    hasEnv ? createClientComponentClient<Database>() : null,
  );

  if (!hasEnv || !supabaseClient) {
    return <>{children}</>;
  }

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
}
