import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/articles/route";

const { mockQueryArticles } = vi.hoisted(() => ({
  mockQueryArticles: vi.fn(),
}));

vi.mock("@/lib/articlesService", async () => {
  const actual = await vi.importActual<typeof import("@/lib/articlesService")>(
    "@/lib/articlesService",
  );
  return {
    ...actual,
    queryArticles: mockQueryArticles,
  };
});

describe("GET /api/articles", () => {
  beforeEach(() => {
    mockQueryArticles.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      perPage: 12,
      hasMore: false,
    });
    mockQueryArticles.mockClear();
  });

  it("caps limit to 50 and forwards topics filter", async () => {
    const request = new NextRequest(
      "http://localhost/api/articles?limit=999&topics=gouvernance&topics=calendrier",
    );
    await GET(request);
    expect(mockQueryArticles).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 50,
        topics: ["gouvernance", "calendrier"],
      }),
    );
  });

  it("passes sort parameter for official weight ordering", async () => {
    const request = new NextRequest(
      "http://localhost/api/articles?sort=official_desc&sport=Athletics",
    );
    await GET(request);
    expect(mockQueryArticles).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: "official_desc",
        sports: ["Athletics"],
      }),
    );
  });
});
