import { Suspense } from "react";

import { ArticlesClient } from "@/components/ArticlesClient";
import { queryArticles } from "@/lib/articlesService";
import { filtersFromParams } from "@/lib/filtering";

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
