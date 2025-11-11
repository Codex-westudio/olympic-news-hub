import { EmbedCarousel } from "@/components/EmbedCarousel";
import { resolveBaseUrl } from "@/lib/url";
import { queryArticles } from "@/lib/articlesService";
import { filtersFromParams, MAX_LIMIT } from "@/lib/filtering";
import type { Article, WidgetConfig } from "@/types/articles";

export const dynamic = "force-dynamic";

type EmbedSearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

async function resolveParams(params: EmbedSearchParams) {
  const resolved = await params;
  const bag = new URLSearchParams();
  Object.entries(resolved).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => entry && bag.append(key, entry));
    } else if (value) {
      bag.append(key, value);
    }
  });
  return bag;
}

async function fetchCustomPayload(bag: URLSearchParams) {
  const filters = filtersFromParams(bag);
  const limit = Math.min(filters.limit ?? 8, MAX_LIMIT);
  const result = await queryArticles({
    query: filters.query,
    sports: filters.sports,
    organisationTypes: filters.organisationTypes,
    countries: filters.countries,
    contentTypes: filters.contentTypes,
    languages: filters.languages,
    topics: filters.topics,
    limit,
    sort: filters.sort,
  });
  const title = bag.get("title") || "Widget Olympic News Hub";
  const description = bag.get("description") || "Flux embarqué personnalisé.";
  return {
    widget: {
      slug: "custom",
      name: title,
      description,
      limit,
      sort: filters.sort ?? "date_desc",
      filters: {},
    } satisfies WidgetConfig,
    items: result.items,
  };
}

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: EmbedSearchParams;
}) {
  const baseUrl = resolveBaseUrl();
  const bag = await resolveParams(searchParams);
  let payload: { widget: WidgetConfig | null; items: Article[] } | null = null;

  if (params.slug === "custom") {
    payload = await fetchCustomPayload(bag);
  } else {
    const url = new URL(`/api/widget/${params.slug}`, baseUrl);
    bag.forEach((value, key) => url.searchParams.append(key, value));

    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
          <p className="rounded-2xl border border-red-400 px-6 py-4 text-red-200">
            Impossible de charger le widget.
          </p>
        </div>
      );
    }

    payload = (await response.json()) as {
      widget: WidgetConfig | null;
      items: Article[];
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Embed</p>
          <h1 className="text-2xl font-semibold">{payload?.widget?.name ?? params.slug}</h1>
          {payload?.widget?.description && (
            <p className="text-sm text-slate-300">{payload.widget.description}</p>
          )}
        </div>
        <EmbedCarousel articles={payload?.items ?? []} />
      </div>
    </div>
  );
}
