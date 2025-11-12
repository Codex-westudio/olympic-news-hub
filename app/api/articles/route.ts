import { NextRequest, NextResponse } from "next/server";

import { ArticleQueryArgs, queryArticles } from "@/lib/articlesService";
import { DEFAULT_PER_PAGE, MAX_LIMIT } from "@/lib/filtering";
import type { ContentType, OrganisationType } from "@/types/articles";

const toList = <T extends string>(params: URLSearchParams, key: string) => {
  const values = params.getAll(key).filter(Boolean) as T[];
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
      sports: toList<string>(searchParams, "sport"),
      organisationTypes: toList<OrganisationType>(searchParams, "organisation_type"),
      countries: toList<string>(searchParams, "country"),
      contentTypes: toList<ContentType>(searchParams, "content_type"),
      languages: toList<string>(searchParams, "language"),
      topics: toList<string>(searchParams, "topics"),
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
