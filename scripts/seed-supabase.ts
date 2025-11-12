import { readFile } from "fs/promises";
import path from "path";

import { createClient } from "@supabase/supabase-js";

import type { Article, WidgetConfig } from "@/types/articles";
import type { Database } from "@/types/database";

const requiredEnv = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing ${key} in environment`);
  }
});

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const dataRoot = path.join(process.cwd(), "data");

async function loadJson<T>(filename: string): Promise<T> {
  const file = path.join(dataRoot, filename);
  const raw = await readFile(file, "utf-8");
  return JSON.parse(raw) as T;
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

async function seed() {
  const articles = await loadJson<Article[]>("fake_articles.json");
  const widgets = await loadJson<WidgetConfig[]>("fake_widgets.json");

  const sourcesMap = new Map<string, Article>();
  articles.forEach((article) => {
    if (!sourcesMap.has(article.source_name)) {
      sourcesMap.set(article.source_name, article);
    }
  });

  const sourcePayload: Database["public"]["Tables"]["sources"]["Insert"][] = Array.from(
    sourcesMap.entries(),
  ).map(([name, article]) => ({
    slug: toSlug(name),
    name,
    organisation_type: article.organisation_type,
    sport: article.sport,
    country: article.country,
    language_primary: article.language,
    website_url: article.source_url,
    is_fake: true,
  }));

  await supabase.from("sources").upsert(sourcePayload, { onConflict: "slug" });

  const { data: storedSources, error: sourceError } = await supabase
    .from("sources")
    .select("id, slug")
    .in(
      "slug",
      sourcePayload.map((source) => source.slug),
    );
  if (sourceError) throw sourceError;

  const sourceIdBySlug = new Map(storedSources?.map((source) => [source.slug, source.id]));

  const articlePayload: Database["public"]["Tables"]["articles"]["Insert"][] = articles.map((article) => {
    const sourceSlug = toSlug(article.source_name);
    const source_id = sourceIdBySlug.get(sourceSlug);
    if (!source_id) {
      throw new Error(`Missing source for ${article.source_name}`);
    }
    return {
      id: article.id,
      source_id,
      source_name: article.source_name,
      organisation_type: article.organisation_type,
      sport: article.sport,
      country: article.country,
      language: article.language,
      content_type: article.content_type,
      title: article.title,
      summary: article.summary,
      published_at: article.published_at,
      source_url: article.source_url,
      image_url: article.image_url,
      topics: article.topics,
      official_weight: article.official_weight,
      status: article.status,
      is_fake: true,
    };
  });

  await supabase.from("articles").upsert(articlePayload, { onConflict: "id" });

  const widgetPayload: Database["public"]["Tables"]["widgets"]["Insert"][] = widgets.map((widget) => ({
    slug: widget.slug,
    name: widget.name,
    description: widget.description,
    filters: widget.filters,
    limit: widget.limit,
    sort: widget.sort,
    owner_id: null,
    is_public: true,
    allowed_domains: widget.allowed_domains ?? [],
    is_fake: true,
  }));

  await supabase.from("widgets").upsert(widgetPayload, { onConflict: "slug" });

  console.info(
    `Seed terminé : ${sourcePayload.length} sources, ${articlePayload.length} articles, ${widgetPayload.length} widgets.`,
  );
}

seed().catch((error) => {
  console.error("Seed Supabase failed:", error);
  process.exit(1);
});
