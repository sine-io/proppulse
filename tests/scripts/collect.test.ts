import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadCommunities } from "../../lib/config";

const REPO_RUNS_DIR = resolve("data/runs");
const DEFAULT_FIXTURE_ROOT = resolve("tests/fixtures");
const TSX_PATH = resolve("node_modules/.bin/tsx");

const expectedCommunities = {
  "mingquan-huayuan": {
    referenceUnitPrice: 23007,
    listingCount: 90,
    recentDealHints: [
      "西青热搜小区榜第60名",
      "关注量超过同城98%的楼盘",
      "二手房历史成交(177)",
    ],
    firstListing: {
      title: "富力津门湖鸣泉花园 2室1厅!可议价!",
      roomCount: 2,
      areaSqm: 88.42,
      totalPriceWan: 199,
      unitPriceYuanPerSqm: 22506,
    },
    pricePoints: [{ label: "3月", priceYuanPerSqm: 23006 }],
    districtName: "西青",
    districtPremiumPct: 7.72,
    momChangePct: 0.99,
    yoyChangePct: -10.72,
  },
  "jiajun-huayuan": {
    referenceUnitPrice: 22234,
    listingCount: 144,
    recentDealHints: [
      "西青人气小区榜第66名",
      "关注量超过同城98%的楼盘",
      "二手房历史成交(193)",
    ],
    firstListing: {
      title: "西青 富力津门湖嘉郡花园 5室3厅 280.00㎡ 580万",
      roomCount: 5,
      areaSqm: 280,
      totalPriceWan: 580,
      unitPriceYuanPerSqm: 20714,
    },
    pricePoints: [{ label: "3月", priceYuanPerSqm: 22233 }],
    districtName: "西青",
    districtPremiumPct: 8.69,
    momChangePct: -0.53,
    yoyChangePct: -6.83,
  },
  "yunshu-huayuan": {
    referenceUnitPrice: 23403,
    listingCount: 104,
    recentDealHints: [
      "西青人气小区榜第63名",
      "关注量超过同城98%的楼盘",
      "二手房历史成交(234)",
      "法拍房历史成交(1)",
    ],
    firstListing: {
      title: "富力津门湖云舒花园2室2厅1卫南朝向173.00万出售",
      roomCount: 2,
      areaSqm: 89,
      totalPriceWan: 173,
      unitPriceYuanPerSqm: 19438,
    },
    pricePoints: [{ label: "3月", priceYuanPerSqm: 23402 }],
    districtName: "西青",
    districtPremiumPct: 7.24,
    momChangePct: 2.69,
    yoyChangePct: -4.49,
  },
  "boxi-huayuan": {
    referenceUnitPrice: 25302,
    listingCount: 58,
    recentDealHints: [
      "西青热搜小区榜第37名",
      "关注量超过同城98%的楼盘",
      "二手房历史成交(122)",
    ],
    firstListing: {
      title: "采光棒能观湖新装修3个月拎包入住给孩子换房出售",
      roomCount: 3,
      areaSqm: 160.08,
      totalPriceWan: 418,
      unitPriceYuanPerSqm: 26112,
    },
    pricePoints: [{ label: "3月", priceYuanPerSqm: 25301 }],
    districtName: "西青",
    districtPremiumPct: 5.91,
    momChangePct: 1.05,
    yoyChangePct: -7.32,
  },
  "haiyi-changzhou-hanboyuan": {
    referenceUnitPrice: 28064,
    listingCount: 70,
    recentDealHints: [
      "西青热搜小区榜第85名",
      "关注量超过同城98%的楼盘",
      "二手房历史成交(210)",
    ],
    firstListing: {
      title: "河西精装海逸长洲瀚波园 2室1厅",
      roomCount: 2,
      areaSqm: 89.14,
      totalPriceWan: 198,
      unitPriceYuanPerSqm: 22212,
    },
    pricePoints: [{ label: "3月", priceYuanPerSqm: 28064 }],
    districtName: "西青",
    districtPremiumPct: 4.1,
    momChangePct: -1.4,
    yoyChangePct: -11.19,
  },
} as const;

const temporaryRoots: string[] = [];

function makeFixtureRoot(): string {
  const tempBase = mkdtempSync(resolve(tmpdir(), "collect-fixtures-"));
  const fixtureRoot = resolve(tempBase, "fixtures");
  cpSync(DEFAULT_FIXTURE_ROOT, fixtureRoot, { recursive: true });
  temporaryRoots.push(tempBase);
  return fixtureRoot;
}

function makeRunsDir(): string {
  const tempBase = mkdtempSync(resolve(tmpdir(), "collect-runs-"));
  const runsDir = resolve(tempBase, "runs");
  mkdirSync(runsDir, { recursive: true });
  temporaryRoots.push(tempBase);
  return runsDir;
}

function runCollect(...args: string[]): void {
  execFileSync(TSX_PATH, ["scripts/collect.ts", ...args], {
    cwd: resolve("."),
    stdio: "pipe",
  });
}

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function readLatestRun(runsDir: string): unknown {
  return readJsonFile(resolve(runsDir, "latest.json"));
}

function listArchivedRuns(runsDir: string): string[] {
  return readdirSync(runsDir)
    .filter((entry) => entry.endsWith(".json") && entry !== "latest.json")
    .sort();
}

function listRunFiles(runsDir: string): string[] {
  return readdirSync(runsDir).sort();
}

function snapshotRunFiles(runsDir: string): Record<string, string> {
  return Object.fromEntries(
    listRunFiles(runsDir).map((entry) => [
      entry,
      readFileSync(resolve(runsDir, entry), "utf8"),
    ]),
  );
}

describe("scripts/collect.ts", () => {
  afterEach(() => {
    while (temporaryRoots.length > 0) {
      rmSync(temporaryRoots.pop()!, { force: true, recursive: true });
    }
  });

  it("writes normalized latest and archived run artifacts for all configured sources", () => {
    const fixtureRoot = makeFixtureRoot();
    const runsDir = makeRunsDir();
    const repoRunsBefore = snapshotRunFiles(REPO_RUNS_DIR);

    runCollect("--fixture", fixtureRoot, "--runs-dir", runsDir);

    expect(snapshotRunFiles(REPO_RUNS_DIR)).toEqual(repoRunsBefore);
    expect(listRunFiles(runsDir)).toContain("latest.json");

    const latestRun = readLatestRun(runsDir) as {
      generatedAt: string;
      sources: Record<string, unknown>;
      communities: Record<string, unknown>;
    };

    expect(Number.isNaN(Date.parse(latestRun.generatedAt))).toBe(false);
    expect(latestRun.sources).toEqual({
      "stats-gov": {
        status: "success",
        latestMonth: "2026-02",
        city: "天津",
        secondaryHomePriceIndexMom: 99.5,
        secondaryHomePriceIndexYoy: 94,
      },
    });

    expect(Object.keys(latestRun.communities).sort()).toEqual(
      loadCommunities()
        .map((community) => community.id)
        .sort(),
    );

    for (const [communityId, expected] of Object.entries(expectedCommunities)) {
      expect(latestRun.communities[communityId]).toEqual({
        fangCommunity: {
          status: "success",
          referenceUnitPrice: expected.referenceUnitPrice,
          listingCount: expected.listingCount,
          recentDealHints: expected.recentDealHints,
          currentListingTeasers: expect.arrayContaining([
            expect.objectContaining(expected.firstListing),
          ]),
        },
        fangWeekreport: {
          status: "success",
          pricePoints: expected.pricePoints,
          listingCount: null,
          districtName: expected.districtName,
          districtPremiumPct: expected.districtPremiumPct,
          momChangePct: expected.momChangePct,
          yoyChangePct: expected.yoyChangePct,
          availableRangeLabels: ["近6月", "近1年", "近3年"],
        },
      });
    }

    const archivedRuns = listArchivedRuns(runsDir);

    expect(archivedRuns).toHaveLength(1);
    expect(readJsonFile(resolve(runsDir, archivedRuns[0]))).toEqual(latestRun);
  }, 15_000);

  it("preserves the last successful normalized values in latest.json when a source fails", () => {
    const fixtureRoot = makeFixtureRoot();
    const runsDir = makeRunsDir();
    const repoRunsBefore = snapshotRunFiles(REPO_RUNS_DIR);

    runCollect("--fixture", fixtureRoot, "--runs-dir", runsDir);

    writeFileSync(
      resolve(fixtureRoot, "fang/community/mingquan-huayuan.html"),
      "<html><body>blocked</body></html>",
      "utf8",
    );

    runCollect("--fixture", fixtureRoot, "--runs-dir", runsDir);

    expect(snapshotRunFiles(REPO_RUNS_DIR)).toEqual(repoRunsBefore);

    const latestRun = readLatestRun(runsDir) as {
      communities: Record<
        string,
        {
          fangCommunity: {
            status: string;
            referenceUnitPrice?: number;
            listingCount?: number;
            recentDealHints?: string[];
            currentListingTeasers?: Array<{
              title: string | null;
              roomCount: number | null;
              areaSqm: number | null;
              totalPriceWan: number | null;
              unitPriceYuanPerSqm: number | null;
            }>;
          };
          fangWeekreport: {
            status: string;
            pricePoints?: Array<{ label: string; priceYuanPerSqm: number | null }>;
            listingCount?: number | null;
            districtName?: string | null;
            districtPremiumPct?: number | null;
            momChangePct?: number | null;
            yoyChangePct?: number | null;
            availableRangeLabels?: string[];
          };
        }
      >;
    };

    expect(listArchivedRuns(runsDir)).toHaveLength(2);
    expect(latestRun.communities["mingquan-huayuan"]).toEqual({
      fangCommunity: {
        status: "failed",
        referenceUnitPrice: 23007,
        listingCount: 90,
        recentDealHints: [
          "西青热搜小区榜第60名",
          "关注量超过同城98%的楼盘",
          "二手房历史成交(177)",
        ],
        currentListingTeasers: expect.arrayContaining([
          expect.objectContaining({
            title: "富力津门湖鸣泉花园 2室1厅!可议价!",
            roomCount: 2,
            areaSqm: 88.42,
            totalPriceWan: 199,
            unitPriceYuanPerSqm: 22506,
          }),
        ]),
      },
      fangWeekreport: {
        status: "success",
        pricePoints: [{ label: "3月", priceYuanPerSqm: 23006 }],
        listingCount: null,
        districtName: "西青",
        districtPremiumPct: 7.72,
        momChangePct: 0.99,
        yoyChangePct: -10.72,
        availableRangeLabels: ["近6月", "近1年", "近3年"],
      },
    });
  }, 15_000);
});
