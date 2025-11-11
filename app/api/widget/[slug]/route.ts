import { NextRequest, NextResponse } from "next/server";

import { queryArticles } from "@/lib/articlesService";
import { findWidgetBySlug, selectWidgetArticles } from "@/lib/data/fakeLoader";
import { MAX_LIMIT } from "@/lib/filtering";
import { fetchWidgetFromSupabase } from "@/lib/articlesService";
import { isSupabaseConfigured } from "@/lib/env";
import type { WidgetFilters } from "@/types/articles";

const daysAgo = (days?: number | null) => {
  if (!days) return undefined;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const buildFilters = (filters?: WidgetFilters) => ({
  sports: filters?.sport,
  organisationTypes: filters?.organisation_type,
  countries: filters?.country,
  contentTypes: filters?.content_type,
  languages: filters?.language,
  topics: filters?.topics,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const fallback = searchParams.get("fallback") === "true";
    const windowDays = Number(searchParams.get("windowDays") ?? "") || 60;
    const fallbackDays = Number(searchParams.get("fallbackWindowDays") ?? "") || 180;
    const limitParam = Number(searchParams.get("limit") ?? "");

    const limit = Math.min(limitParam || 0, MAX_LIMIT);
    const supabaseReady = isSupabaseConfigured();

    let widget = null;
    if (supabaseReady) {
      widget = await fetchWidgetFromSupabase(params.slug);
    }

    if (!widget) {
      widget = await findWidgetBySlug(params.slug);
    }

    if (!widget) {
      return NextResponse.json({ message: "Widget introuvable" }, { status: 404 });
    }

    const queryLimit = limit > 0 ? limit : widget.limit;

    if (!supabaseReady) {
      const items = await selectWidgetArticles(widget, {
        windowDays: undefined,
        fallbackDays: undefined,
      });
      return NextResponse.json({
        widget,
        items: items.slice(0, queryLimit),
      });
    }

    const filters = buildFilters(widget.filters);

    const primaryWindow = daysAgo(windowDays);
    let result = await queryArticles({
      ...filters,
      limit: queryLimit,
      sort: widget.sort,
      publishedAfter: primaryWindow,
    });

    if (!result.items.length && fallback) {
      const fallbackWindow = daysAgo(fallbackDays);
      result = await queryArticles({
        ...filters,
        limit: queryLimit,
        sort: widget.sort,
        publishedAfter: fallbackWindow,
      });
    }

    return NextResponse.json({
      widget,
      items: result.items.slice(0, queryLimit),
    });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
