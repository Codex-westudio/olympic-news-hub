import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET as widgetGet } from "@/app/api/widget/[slug]/route";

describe("GET /api/widget/[slug]", () => {
  it("returns filtered articles for the WA governance widget", async () => {
    const request = new NextRequest("http://localhost/api/widget/wa-fr-governance");
    const response = await widgetGet(request, { params: { slug: "wa-fr-governance" } });
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.items.length).toBeLessThanOrEqual(8);
    payload.items.forEach((article: any) => {
      expect(article.sport).toBe("Athletics");
      expect(article.language).toBe("FR");
    });
  });
});
