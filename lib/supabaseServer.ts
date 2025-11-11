import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/env";

let serviceClient: SupabaseClient<Database> | null = null;

export function getServiceRoleClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Provide the environment variables first.");
  }

  if (!serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    serviceClient = createClient<Database>(url, serviceKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return serviceClient;
}
