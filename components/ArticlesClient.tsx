"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ArticleCard } from "@/components/ArticleCard";
import { FiltersBar, FiltersState } from "@/components/FiltersBar";
import { Pagination } from "@/components/Pagination";
import { PaginatedArticles, SortOption } from "@/types/articles";

interface ArticlesClientProps {
  initialData: PaginatedArticles;
  initialParams: string;
}

export function ArticlesClient({ initialData, initialParams }: ArticlesClientProps) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialParamsRef = useRef(initialParams);
  const initializedRef = useRef(false);

  const paramsString = searchParams?.toString() ?? "";

  const currentFilters: FiltersState = useMemo(() => {
    const params = new URLSearchParams(paramsString);
    return {
      query: params.get("query") ?? undefined,
      sport: params.get("sport") ?? undefined,
      organisation_type: params.get("organisation_type") ?? undefined,
      country: params.get("country") ?? undefined,
      content_type: params.get("content_type") ?? undefined,
      language: params.get("language") ?? undefined,
      topics: params.getAll("topics"),
    };
  }, [paramsString]);

  const sort = (searchParams?.get("sort") as SortOption) ?? "date_desc";

  useEffect(() => {
    const qs = paramsString;
    if (!initializedRef.current && qs === initialParamsRef.current) {
      initializedRef.current = true;
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/articles?${qs}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Impossible de charger les articles");
        }
        const payload = (await response.json()) as PaginatedArticles;
        setData(payload);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [paramsString]);

  const updateParams = (entries: Record<string, string | string[] | undefined>) => {
    const next = new URLSearchParams(paramsString);
    Object.entries(entries).forEach(([key, value]) => {
      next.delete(key);
      if (Array.isArray(value)) {
        value.filter(Boolean).forEach((item) => next.append(key, item));
      } else if (value) {
        next.set(key, value);
      }
    });
    next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleApplyFilters = (filters: FiltersState, nextSort: SortOption) => {
    updateParams({
      query: filters.query?.trim() || undefined,
      sport: filters.sport,
      organisation_type: filters.organisation_type,
      country: filters.country,
      content_type: filters.content_type,
      language: filters.language,
      topics: filters.topics?.length ? filters.topics : undefined,
      sort: nextSort,
      limit: String(data.perPage),
    });
  };

  const handleReset = () => {
    router.replace(pathname, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(paramsString);
    next.set("page", String(page));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">World Sports Pulse</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Toutes les actus officielles en un seul endroit
        </h1>
        <p className="text-base text-slate-600">
          Filtres multicritères, tri par poids officiel et pagination client. Les données sont
          locales en phase 1, puis synchronisées via Supabase en phase 2.
        </p>
      </div>

      <FiltersBar
        initialState={currentFilters}
        sort={sort}
        onApply={handleApplyFilters}
        onReset={handleReset}
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.items.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {!data.items.length && !isLoading && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
          Aucun article ne correspond à ces filtres.
        </div>
      )}

      <Pagination
        page={data.page}
        total={data.total}
        perPage={data.perPage}
        onPageChange={handlePageChange}
      />

      {isLoading && (
        <div className="fixed inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-white/90 px-6 py-2 text-sm text-slate-600 shadow-lg">
          Mise à jour des articles…
        </div>
      )}
    </section>
  );
}
