"use client";

import { useState } from "react";
import clsx from "clsx";

interface ProfileRow {
  id: string;
  email: string | null;
  plan: string;
  plan_expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const plans = [
  { value: "trial", label: "Essai" },
  { value: "personal", label: "Personnel" },
  { value: "enterprise", label: "Entreprise" },
];

export function AdminTable({ initialData }: { initialData: ProfileRow[] }) {
  const [rows, setRows] = useState(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (id: string, updates: Partial<ProfileRow>) => {
    setLoadingId(id);
    setError(null);
    try {
      const response = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!response.ok) {
        throw new Error("Impossible de mettre à jour le plan");
      }
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {error && (
        <div className="bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}
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
          {rows.map((profile) => (
            <tr key={profile.id}>
              <td className="px-4 py-3">{profile.email ?? "—"}</td>
              <td className="px-4 py-3">
                <select
                  value={profile.plan}
                  onChange={(event) => handleUpdate(profile.id, { plan: event.target.value })}
                  className="rounded-2xl border border-slate-200 px-3 py-1 text-sm outline-none"
                  disabled={loadingId === profile.id}
                >
                  {plans.map((plan) => (
                    <option key={plan.value} value={plan.value}>
                      {plan.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  type="date"
                  value={profile.plan_expires_at ? profile.plan_expires_at.substring(0, 10) : ""}
                  onChange={(event) =>
                    handleUpdate(profile.id, {
                      plan_expires_at: event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null,
                    })
                  }
                  className="rounded-2xl border border-slate-200 px-3 py-1 text-sm outline-none"
                  disabled={loadingId === profile.id}
                />
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    profile.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700",
                  )}
                  disabled={loadingId === profile.id}
                  onClick={() => handleUpdate(profile.id, { is_active: !profile.is_active })}
                >
                  {profile.is_active ? "Actif" : "Suspendu"}
                </button>
              </td>
              <td className="px-4 py-3">
                {new Date(profile.created_at).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
