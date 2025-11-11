import { Article, ArticleFilters, PaginatedArticles, SortOption } from "@/types/articles";

export const DEFAULT_PER_PAGE = 12;
export const MAX_LIMIT = 50;

const textIncludes = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase());

export function applyFilters(items: Article[], filters: ArticleFilters): Article[] {
  return items.filter((item) => {
    if (filters.query) {
      const haystacks = [
        item.title,
        item.summary,
        item.source_name,
        item.sport,
        item.country,
      ];
      const hasMatch = haystacks.some((field) => textIncludes(field, filters.query!));
      if (!hasMatch) {
        return false;
      }
    }

    if (filters.sports?.length && !filters.sports.includes(item.sport)) {
      return false;
    }

    if (
      filters.organisationTypes?.length &&
      !filters.organisationTypes.includes(item.organisation_type)
    ) {
      return false;
    }

    if (filters.countries?.length && !filters.countries.includes(item.country)) {
      return false;
    }

    if (filters.contentTypes?.length && !filters.contentTypes.includes(item.content_type)) {
      return false;
    }

    if (filters.languages?.length && !filters.languages.includes(item.language)) {
      return false;
    }

    if (
      filters.topics?.length &&
      !item.topics.some((topic) => filters.topics?.includes(topic))
    ) {
      return false;
    }

    if (filters.statuses?.length && !filters.statuses.includes(item.status)) {
      return false;
    }

    return true;
  });
}

export function sortItems(items: Article[], sort: SortOption): Article[] {
  const sorted = [...items];

  if (sort === "official_desc") {
    sorted.sort((a, b) => {
      if (b.official_weight === a.official_weight) {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
      return b.official_weight - a.official_weight;
    });
    return sorted;
  }

  const factor = sort === "date_asc" ? 1 : -1;
  sorted.sort(
    (a, b) =>
      factor *
      (new Date(a.published_at).getTime() - new Date(b.published_at).getTime()),
  );

  return sorted;
}

export function paginate(
  items: Article[],
  page = 1,
  perPage = DEFAULT_PER_PAGE,
): PaginatedArticles {
  const validPage = Math.max(page, 1);
  const validPerPage = Math.max(1, perPage);
  const start = (validPage - 1) * validPerPage;
  const end = start + validPerPage;
  const sliced = items.slice(start, end);

  return {
    items: sliced,
    total: items.length,
    page: validPage,
    perPage: validPerPage,
    hasMore: end < items.length,
  };
}

export interface QueryStringArgs extends ArticleFilters {
  limit?: number;
  page?: number;
  sort?: SortOption;
}

export function buildQueryString(filters: QueryStringArgs = {}): string {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("query", filters.query);
  }

  const mapArray = (values: string[] | undefined, key: string) => {
    values?.forEach((value) => {
      if (value) params.append(key, value);
    });
  };

  mapArray(filters.sports, "sport");
  mapArray(filters.organisationTypes, "organisation_type");
  mapArray(filters.countries, "country");
  mapArray(filters.contentTypes, "content_type");
  mapArray(filters.languages, "language");
  mapArray(filters.topics, "topics");

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(Math.min(filters.limit, MAX_LIMIT)));
  }

  return params.toString();
}

type ParamsLike = Pick<URLSearchParams, "get" | "getAll">;

export function filtersFromParams(params: ParamsLike): QueryStringArgs {
  const getList = (key: string) => params.getAll(key).filter(Boolean);

  const query = params.get("query") ?? undefined;
  const sports = getList("sport");
  const organisationTypes = getList("organisation_type") as ArticleFilters["organisationTypes"];
  const countries = getList("country");
  const contentTypes = getList("content_type") as ArticleFilters["contentTypes"];
  const languages = getList("language");
  const topics = getList("topics");
  const sort = (params.get("sort") as SortOption) ?? "date_desc";
  const limit = Number(params.get("limit") ?? "") || undefined;
  const page = Number(params.get("page") ?? "") || 1;

  return {
    query,
    sports: sports.length ? sports : undefined,
    organisationTypes: organisationTypes?.length ? organisationTypes : undefined,
    countries: countries.length ? countries : undefined,
    contentTypes: contentTypes?.length ? contentTypes : undefined,
    languages: languages.length ? languages : undefined,
    topics: topics.length ? topics : undefined,
    sort,
    limit,
    page,
  };
}
