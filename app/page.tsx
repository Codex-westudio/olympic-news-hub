import { Suspense } from "react";

import { ArticlesClient } from "@/components/ArticlesClient";
import { LandingPage } from "@/components/LandingPage";
import { queryArticles, getServerSession } from "@/lib/articlesService";
import { filtersFromParams } from "@/lib/filtering";
import { ensureProfile, hasActivePlan } from "@/lib/profile";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

async function resolveSearchParams(params: SearchParams) {
  const resolved = await params;
  const search = new URLSearchParams();
  Object.entries(resolved).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => item && search.append(key, item));
    } else if (value) {
      search.append(key, value);
    }
  });
  return search;
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    data: { session },
  } = await getServerSession();
  if (!session) {
    return <LandingPage />;
  }

  const profile = await ensureProfile(session.user);
  if (!hasActivePlan(profile)) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Essai terminé</p>
        <h2 className="text-2xl font-semibold text-slate-900">Ton plan est expiré</h2>
        <p className="text-sm text-slate-600">
          L’essai gratuit de 30 jours est arrivé à son terme. Choisis un plan pour réactiver l’accès aux
          articles et aux widgets.
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="/#plans"
            className="rounded-full border border-midnight px-5 py-2 text-sm font-semibold text-midnight transition hover:bg-midnight hover:text-white"
          >
            Voir les plans
          </a>
          <a
            href="mailto:hello@olympicnewshub.com"
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            Contacter le studio
          </a>
        </div>
      </div>
    );
  }

  const paramBag = await resolveSearchParams(searchParams);
  const filters = filtersFromParams(paramBag);
  const initialData = await queryArticles({
    query: filters.query,
    sports: filters.sports,
    organisationTypes: filters.organisationTypes,
    countries: filters.countries,
    contentTypes: filters.contentTypes,
    languages: filters.languages,
    topics: filters.topics,
    limit: filters.limit,
    page: filters.page,
    sort: filters.sort,
  });

  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Chargement…</div>}>
      <ArticlesClient initialData={initialData} initialParams={paramBag.toString()} />
    </Suspense>
  );
}
