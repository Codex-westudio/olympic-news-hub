import { redirect } from "next/navigation";

import { ensureProfile } from "@/lib/profile";
import { getServiceRoleClient } from "@/lib/supabaseServer";
import { getServerSession } from "@/lib/articlesService";
import { AdminTable } from "@/components/admin/AdminTable";

export default async function AdminPage() {
  const {
    data: { user },
  } = await getServerSession();
  if (!user) {
    redirect("/auth");
  }

  await ensureProfile(user);

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
    redirect("/");
  }

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, plan, plan_expires_at, is_active, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Administration</p>
        <h1 className="text-3xl font-semibold text-slate-900">Utilisateurs & plans</h1>
        <p className="text-sm text-slate-600">
          Modifie les plans, prolonge les essais et suspends les accès en un clic.
        </p>
      </div>
      <AdminTable initialData={data ?? []} />
    </div>
  );
}
