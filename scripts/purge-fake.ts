import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.");
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false },
});

async function purge() {
  const tables: Array<keyof Database["public"]["Tables"]> = ["articles", "widgets", "sources"];
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .eq("is_fake", true);
    if (error) throw error;
    console.info(`Supprimé ${count ?? 0} enregistrements fake dans ${table}`);
  }
}

purge().catch((error) => {
  console.error("Purge Supabase failed:", error);
  process.exit(1);
});
