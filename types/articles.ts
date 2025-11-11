export type OrganisationType = "IF" | "NOC" | "OCOG" | "IOC";

export type ContentType =
  | "news"
  | "communiqué"
  | "résultat"
  | "règlement"
  | "nomination"
  | "rapport"
  | "événement";

export type ArticleStatus = "published" | "review" | "draft";

export interface Article {
  id: string;
  source_name: string;
  organisation_type: OrganisationType;
  sport: string;
  country: string;
  language: string;
  content_type: ContentType;
  title: string;
  summary: string;
  published_at: string;
  source_url: string;
  image_url: string;
  topics: string[];
  official_weight: number;
  status: ArticleStatus;
}

export type SortOption = "date_desc" | "date_asc" | "official_desc";

export interface ArticleFilters {
  query?: string;
  sports?: string[];
  organisationTypes?: OrganisationType[];
  countries?: string[];
  contentTypes?: ContentType[];
  languages?: string[];
  topics?: string[];
  statuses?: ArticleStatus[];
}

export interface PaginationArgs {
  page?: number;
  perPage?: number;
}

export interface PaginatedArticles {
  items: Article[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface WidgetFilters {
  sport?: string[];
  organisation_type?: OrganisationType[];
  country?: string[];
  content_type?: ContentType[];
  language?: string[];
  topics?: string[];
}

export interface WidgetConfig {
  slug: string;
  name: string;
  description?: string;
  limit: number;
  sort: SortOption;
  filters: WidgetFilters;
  allowed_domains?: string[];
}
