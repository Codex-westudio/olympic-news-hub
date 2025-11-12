import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { applyFilters, DEFAULT_PER_PAGE, MAX_LIMIT, paginate, sortItems } from "@/lib/filtering";
import { getServiceRoleClient } from "@/lib/supabaseServer";
import { loadFakeArticles } from "@/lib/data/fakeLoader";
import { Database } from "@/types/database";
import {
  ArticleFilters,
  PaginatedArticles,
  SortOption,
  WidgetConfig,
  WidgetFilters,
} from "@/types/articles";
import { isSupabaseConfigured } from "@/lib/env";

export interface ArticleQueryArgs extends ArticleFilters {
  limit?: number;
  page?: number;
  sort?: SortOption;
  publishedAfter?: string;
}

export async function queryArticles(args: ArticleQueryArgs = {}): Promise<PaginatedArticles> {
  if (isSupabaseConfigured()) {
    return fetchArticlesFromSupabase(args);
  }

  const limit = Math.min(args.limit ?? DEFAULT_PER_PAGE, MAX_LIMIT);
  const items = await loadFakeArticles();
  const filteredBase = applyFilters(items, {
    ...args,
    statuses: args.statuses ?? ["published"],
  });
  const filtered = args.publishedAfter
    ? filteredBase.filter(
        (item) => new Date(item.published_at).getTime() >= new Date(args.publishedAfter!).getTime(),
      )
    : filteredBase;
  const sorted = sortItems(filtered, args.sort ?? "date_desc");
  return paginate(sorted, args.page ?? 1, limit);
}

async function fetchArticlesFromSupabase(args: ArticleQueryArgs): Promise<PaginatedArticles> {
  const supabase = getServiceRoleClient();
  const limit = Math.min(args.limit ?? DEFAULT_PER_PAGE, MAX_LIMIT);
  const page = Math.max(args.page ?? 1, 1);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("v_widget_articles")
    .select(
      "id, source_id, source_name, organisation_type, sport, country, language, content_type, title, summary, published_at, source_url, image_url, topics, official_weight, status",
      { count: "exact" },
    )
    .eq("status", "published");

  const applyInFilter = <Key extends string>(column: Key, values?: readonly string[]) => {
    if (values?.length) {
      query = query.in(column, values as string[]);
    }
  };

  applyInFilter("sport", args.sports);
  applyInFilter("organisation_type", args.organisationTypes);
  applyInFilter("country", args.countries);
  applyInFilter("content_type", args.contentTypes);
  applyInFilter("language", args.languages);

  if (args.topics?.length) {
    query = query.overlaps("topics", args.topics);
  }

  if (args.publishedAfter) {
    query = query.gte("published_at", args.publishedAfter);
  }

  if (args.query) {
    const escaped = args.query.replace(/[%]/g, "");
    const pattern = `%${escaped}%`;
    query = query.or(
      `title.ilike.${pattern},summary.ilike.${pattern},source_name.ilike.${pattern},sport.ilike.${pattern}`,
    );
  }

  if (args.sort === "official_desc") {
    query = query.order("official_weight", { ascending: false }).order("published_at", {
      ascending: false,
    });
  } else if (args.sort === "date_asc") {
    query = query.order("published_at", { ascending: true });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: data ?? [],
    total: count ?? data?.length ?? 0,
    page,
    perPage: limit,
    hasMore: Boolean(count && to + 1 < count),
  };
}

export async function fetchWidgetFromSupabase(
  slug: string,
  client?: SupabaseClient<Database>,
): Promise<WidgetConfig | null> {
  if (!isSupabaseConfigured()) return null;
  const serviceClient = client ?? getServiceRoleClient();
  const { data, error } = await serviceClient
    .from("widgets")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    slug: data.slug,
    name: data.name,
    description: data.description ?? undefined,
    limit: data.limit,
    sort: (data.sort as SortOption) ?? "date_desc",
    filters: (data.filters as WidgetFilters) ?? {},
    allowed_domains: data.allowed_domains,
  };
}

export async function getServerSession() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: { session: null }, error: null };
  }
  const cookieStore = cookies();
  const client = createServerComponentClient<Database>({ cookies: () => cookieStore });
  return client.auth.getSession();
}
