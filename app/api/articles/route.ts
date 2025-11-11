import { NextRequest, NextResponse } from "next/server";

import { ArticleQueryArgs, queryArticles } from "@/lib/articlesService";
import { DEFAULT_PER_PAGE, MAX_LIMIT } from "@/lib/filtering";

const toList = (params: URLSearchParams, key: string) => {
  const values = params.getAll(key).filter(Boolean);
  return values.length ? values : undefined;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit") ?? "") || DEFAULT_PER_PAGE;
    const limit = Math.min(limitParam, MAX_LIMIT);
    const page = Number(searchParams.get("page") ?? "") || 1;
    const sort = (searchParams.get("sort") as ArticleQueryArgs["sort"]) ?? "date_desc";

    const input: ArticleQueryArgs = {
      query: searchParams.get("query") ?? undefined,
      sports: toList(searchParams, "sport"),
      organisationTypes: toList(searchParams, "organisation_type"),
      countries: toList(searchParams, "country"),
      contentTypes: toList(searchParams, "content_type"),
      languages: toList(searchParams, "language"),
      topics: toList(searchParams, "topics"),
      limit,
      page,
      sort,
    };

    const result = await queryArticles(input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
