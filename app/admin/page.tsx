import Link from "next/link";
import { redirect } from "next/navigation";

import { ensureProfile } from "@/lib/profile";
import { getServiceRoleClient } from "@/lib/supabaseServer";
import { getServerSession } from "@/lib/articlesService";

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Administration</p>
          <h1 className="text-3xl font-semibold text-slate-900">Utilisateurs & plans</h1>
          <p className="text-sm text-slate-600">
            Vue consolidée des comptes, plans actifs et dates de fin d’essai.
          </p>
        </div>
        <Link
          href="mailto:hello@olympicnewshub.com"
          className="rounded-full border border-midnight px-4 py-2 text-sm font-semibold text-midnight"
        >
          Contacter un membre
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Expiration</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Créé le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {(data || []).map((profile) => (
              <tr key={profile.id}>
                <td className="px-4 py-3">{profile.email ?? "—"}</td>
                <td className="px-4 py-3 font-semibold capitalize">{profile.plan}</td>
                <td className="px-4 py-3">
                  {profile.plan_expires_at
                    ? new Date(profile.plan_expires_at).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {profile.is_active ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Actif
                    </span>
                  ) : (
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                      Suspendu
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {new Date(profile.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
