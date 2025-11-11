import { readFile } from "fs/promises";
import path from "path";

import { applyFilters, sortItems } from "@/lib/filtering";
import { Article, WidgetConfig } from "@/types/articles";

let articlesCache: Article[] | null = null;
let widgetsCache: WidgetConfig[] | null = null;

const dataRoot = path.join(process.cwd(), "data");

async function readJson<T>(filename: string): Promise<T> {
  const filePath = path.join(dataRoot, filename);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export async function loadFakeArticles(): Promise<Article[]> {
  if (!articlesCache) {
    articlesCache = await readJson<Article[]>("fake_articles.json");
  }
  return articlesCache;
}

export async function loadFakeWidgets(): Promise<WidgetConfig[]> {
  if (!widgetsCache) {
    widgetsCache = await readJson<WidgetConfig[]>("fake_widgets.json");
  }
  return widgetsCache;
}

export async function findWidgetBySlug(slug: string): Promise<WidgetConfig | undefined> {
  const widgets = await loadFakeWidgets();
  return widgets.find((widget) => widget.slug === slug);
}

export async function selectWidgetArticles(
  widget: WidgetConfig,
  options: { windowDays?: number; fallbackDays?: number } = {},
): Promise<Article[]> {
  const articles = await loadFakeArticles();
  const now = new Date();
  const windowDays = options.windowDays ?? null;
  const fallbackDays = options.fallbackDays ?? null;

  const withinWindow = (item: Article, days: number | null) => {
    if (!days) return true;
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - days);
    return new Date(item.published_at) >= threshold;
  };

  let filtered = applyFilters(articles, {
    sports: widget.filters.sport,
    organisationTypes: widget.filters.organisation_type,
    countries: widget.filters.country,
    contentTypes: widget.filters.content_type,
    languages: widget.filters.language,
    topics: widget.filters.topics,
    statuses: ["published"],
  });

  let scoped = filtered.filter((item) => withinWindow(item, windowDays));

  if (!scoped.length && fallbackDays) {
    scoped = filtered.filter((item) => withinWindow(item, fallbackDays));
  }

  const sorted = sortItems(scoped, widget.sort);
  return sorted.slice(0, widget.limit);
}
