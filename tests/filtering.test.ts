import { applyFilters, buildQueryString, paginate, sortItems } from "@/lib/filtering";
import type { Article } from "@/types/articles";

const makeArticle = (override: Partial<Article>): Article => ({
  id: "id",
  source_name: "World Athletics",
  organisation_type: "IF",
  sport: "Athletics",
  country: "FRA",
  language: "FR",
  content_type: "news",
  title: "Titre test",
  summary: "Résumé test",
  published_at: "2024-10-10T00:00:00.000Z",
  source_url: "https://example.com",
  image_url: "https://images.unsplash.com/photo-1",
  topics: ["gouvernance"],
  official_weight: 0.5,
  status: "published",
  ...override,
});

describe("filtering utilities", () => {
  const dataset = [
    makeArticle({
      id: "a",
      title: "Intégrité financière",
      sport: "Athletics",
      language: "FR",
      topics: ["intégrité", "gouvernance"],
      official_weight: 0.3,
      published_at: "2024-08-01T00:00:00.000Z",
    }),
    makeArticle({
      id: "b",
      title: "Résultats mondiaux",
      sport: "Cycling",
      language: "EN",
      topics: ["athlètes"],
      official_weight: 0.9,
      published_at: "2024-09-01T00:00:00.000Z",
    }),
    makeArticle({
      id: "c",
      title: "Calendrier volleyball",
      sport: "Volleyball",
      language: "ES",
      topics: ["calendrier"],
      official_weight: 0.7,
      published_at: "2024-07-01T00:00:00.000Z",
    }),
  ];

  it("filters by multiple criteria", () => {
    const filtered = applyFilters(dataset, {
      sports: ["Athletics"],
      languages: ["FR"],
      topics: ["intégrité"],
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("a");
  });

  it("supports partial text search", () => {
    const filtered = applyFilters(dataset, { query: "volley" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("c");
  });

  it("sorts by official weight when requested", () => {
    const sorted = sortItems(dataset, "official_desc");
    expect(sorted[0].id).toBe("b");
    expect(sorted[sorted.length - 1].id).toBe("a");
  });

  it("paginates and reports metadata", () => {
    const page = paginate(dataset, 2, 1);
    expect(page.items).toHaveLength(1);
    expect(page.page).toBe(2);
    expect(page.total).toBe(3);
  });

  it("builds query strings and caps limit at 50", () => {
    const query = buildQueryString({
      sports: ["Athletics"],
      topics: ["intégrité", "calendrier"],
      limit: 200,
      sort: "official_desc",
    });
    expect(query).toContain("sport=Athletics");
    expect(query.match(/topics=/g)).toHaveLength(2);
    expect(query).toContain("limit=50");
  });
});
