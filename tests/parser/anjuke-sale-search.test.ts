import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parseAnjukeSaleSearch } from "../../parser/anjuke-sale-search";

function readFixtureHtml(fileName: string): string {
  return readFileSync(
    resolve("tests/fixtures/anjuke/sale-search", fileName),
    "utf8",
  );
}

describe("parseAnjukeSaleSearch", () => {
  it("keeps only normalized exact 万科东第 matches and drops fuzzy, duplicate, and incomplete cards", () => {
    const parsed = parseAnjukeSaleSearch(readFixtureHtml("wanke-dongdi.html"));

    expect(parsed.pageState).toBe("results");
    expect(parsed.listings).toEqual([
      {
        title: "万科东第 南北通透两居",
        roomCount: 2,
        areaSqm: 89.3,
        totalPriceWan: 155,
        unitPriceYuanPerSqm: 17357,
        detailUrl:
          "https://m.anjuke.com/tj/sale/S4000000000000001/?from=fixture-main",
      },
      {
        title: "万科·东第 精装三室",
        roomCount: 3,
        areaSqm: 127.1,
        totalPriceWan: 238,
        unitPriceYuanPerSqm: 18726,
        detailUrl:
          "https://m.anjuke.com/tj/sale/S4000000000000002/?from=fixture-main",
      },
      {
        title: "万科 东第 高楼层采光好",
        roomCount: 2,
        areaSqm: 88,
        totalPriceWan: 162,
        unitPriceYuanPerSqm: 18410,
        detailUrl:
          "https://m.anjuke.com/tj/sale/S4000000000000003/?from=fixture-main",
      },
    ]);
  });

  it("marks empty-result HTML so the caller can treat it as no valid listings", () => {
    expect(parseAnjukeSaleSearch(readFixtureHtml("wanke-dongdi-empty.html"))).toEqual(
      {
        pageState: "empty",
        listings: [],
      },
    );
  });

  it("marks blocked HTML so the caller can treat it as a failed parse", () => {
    expect(
      parseAnjukeSaleSearch(readFixtureHtml("wanke-dongdi-blocked.html")),
    ).toEqual({
      pageState: "blocked",
      listings: [],
    });
  });
});
