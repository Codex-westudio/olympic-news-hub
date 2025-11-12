import Link from "next/link";

import { WidgetBuilderClient } from "@/components/WidgetBuilderClient";
import { getServerSession } from "@/lib/articlesService";
import { ensureProfile, hasActivePlan } from "@/lib/profile";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function WidgetBuilderPage() {
  const {
    data: { session },
  } = await getServerSession();
  const profile = session?.user ? await ensureProfile(session.user) : null;
  const active = hasActivePlan(profile);

  if (!active) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Plan requis</p>
        <h2 className="text-2xl font-semibold text-slate-900">Active un plan pour créer des widgets</h2>
        <p className="text-sm text-slate-600">
          Le générateur d’embed est réservé aux comptes dont le plan est actif. Choisis une offre ou
          contacte-nous pour débloquer l’accès.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/#plans"
            className="rounded-full border border-midnight px-5 py-2 text-sm font-semibold text-midnight transition hover:bg-midnight hover:text-white"
          >
            Voir les plans
          </Link>
          <a
            href="mailto:hello@olympicnewshub.com"
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            Nous contacter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Widget builder</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Génère ton embed Olympic News Hub
        </h1>
        <p className="text-base text-slate-600">
          Compose un widget filtré (sport, langue, topics, tri) puis récupère l’iframe à intégrer
          dans n’importe quel CMS. L’aperçu ci-dessous utilise les mêmes données que la page
          principale.
        </p>
      </div>
      <WidgetBuilderClient siteUrl={siteUrl} />
    </div>
  );
}
