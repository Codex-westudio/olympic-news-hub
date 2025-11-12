import { addDays, isAfter } from "date-fns";

import { getServiceRoleClient } from "@/lib/supabaseServer";
import type { Database } from "@/types/database";

export type ProfilePlan = Database["public"]["Tables"]["profiles"]["Row"];

export async function ensureProfile(user: { id: string; email?: string | null }) {
  if (!user?.id) {
    return null;
  }

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, plan, plan_expires_at, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const expiresAt = addDays(new Date(), 30).toISOString();
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? null,
      plan: "trial",
      plan_expires_at: expiresAt,
      is_active: true,
    });
    return {
      id: user.id,
      email: user.email ?? null,
      full_name: null,
      avatar_url: null,
      plan: "trial",
      plan_expires_at: expiresAt,
      plan_notes: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ProfilePlan;
  }

  return data as ProfilePlan;
}

export function hasActivePlan(profile: ProfilePlan | null) {
  if (!profile) return false;
  if (!profile.is_active) return false;
  if (!profile.plan_expires_at) return true;
  return isAfter(new Date(profile.plan_expires_at), new Date());
}
