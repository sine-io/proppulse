import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import { loadCommunities, loadSegments } from "../lib/config";
import {
  getSegmentVerdict,
  type SegmentVerdictWindow,
} from "../lib/verdicts";
import { DATA_DIR, resolveDataPaths } from "../lib/paths";

interface CityMarketSeriesEntry {
  date: string;
  generatedAt: string;
  sourceMonth: string;
  secondaryHomePriceIndexMom: number;
  secondaryHomePriceIndexYoy: number;
  verdict: string;
}

interface CommunitySegmentSeriesEntry {
  date: string;
  generatedAt: string;
  derivedFrom: "segment-teasers" | "community-fallback";
  listingUnitPriceMedian: number | null;
  listingUnitPriceMin: number | null;
  listingsCount: number;
  suspectedDealCount: number;
  manualDealCount: number;
  manualDealUnitPriceMedian: number | null;
  manualLatestSampleAt: string | null;
}

function parseCommandLineArguments(argv: string[]): { dataDir: string } {
  let dataDir = DATA_DIR;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--data-dir") {
      const candidate = argv[index + 1];

      if (!candidate || candidate.startsWith("-")) {
        throw new Error("--data-dir requires a path");
      }

      dataDir = resolve(candidate);
      index += 1;
    }
  }

  return { dataDir };
}

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDate(dateString: string, offsetDays: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return formatDate(date);
}

function inWindow(date: string, windowStart: string, windowEnd: string): boolean {
  return date >= windowStart && date <= windowEnd;
}

function latestEntryWithinWindow<T extends { date: string; generatedAt: string }>(
  series: T[],
  windowStart: string,
  windowEnd: string,
): T | null {
  return (
    series
      .filter((entry) => inWindow(entry.date, windowStart, windowEnd))
      .sort((left, right) => left.generatedAt.localeCompare(right.generatedAt))
      .at(-1) ?? null
  );
}

function toVerdictWindow(entry: CommunitySegmentSeriesEntry | null): SegmentVerdictWindow {
  if (!entry) {
    return {
      listingUnitPriceMedian: null,
      listingUnitPriceMin: null,
      listingsCount: 0,
      suspectedDealCount: 0,
      manualDealCount: 0,
    };
  }

  return {
    listingUnitPriceMedian: entry.listingUnitPriceMedian,
    listingUnitPriceMin: entry.listingUnitPriceMin,
    listingsCount: entry.listingsCount,
    suspectedDealCount: entry.suspectedDealCount,
    manualDealCount: entry.manualDealCount,
  };
}

async function main(): Promise<void> {
  const { dataDir } = parseCommandLineArguments(process.argv.slice(2));
  const paths = resolveDataPaths(dataDir);
  const communities = loadCommunities(paths.communitiesConfigPath);
  const segments = loadSegments(paths.segmentsConfigPath);
  const cityMarketPath = resolve(paths.seriesDir, "city-market", "tianjin.json");
  const cityMarketSeries = existsSync(cityMarketPath)
    ? readJsonFile<{ city: string; series: CityMarketSeriesEntry[] }>(cityMarketPath)
    : { city: "天津", series: [] };
  const latestDate = cityMarketSeries.series.at(-1)?.date;

  if (!latestDate) {
    return;
  }

  const windows = {
    w0: {
      start: shiftDate(latestDate, -6),
      end: latestDate,
    },
    wMinus1: {
      start: shiftDate(latestDate, -13),
      end: shiftDate(latestDate, -7),
    },
    wMinus2: {
      start: shiftDate(latestDate, -20),
      end: shiftDate(latestDate, -14),
    },
  };

  const report = {
    generatedAt: new Date().toISOString(),
    weekEnding: latestDate,
    cityMarket: cityMarketSeries.series.at(-1) ?? null,
    communities: Object.fromEntries(
      communities.map((community) => {
        const segmentsReport = Object.fromEntries(
          segments.map((segment) => {
            const seriesPath = resolve(
              paths.seriesDir,
              "communities",
              community.id,
              `${segment.id}.json`,
            );
            const seriesFile = existsSync(seriesPath)
              ? readJsonFile<{ series: CommunitySegmentSeriesEntry[] }>(seriesPath)
              : { series: [] };
            const wMinus2 = latestEntryWithinWindow(
              seriesFile.series,
              windows.wMinus2.start,
              windows.wMinus2.end,
            );
            const wMinus1 = latestEntryWithinWindow(
              seriesFile.series,
              windows.wMinus1.start,
              windows.wMinus1.end,
            );
            const w0 = latestEntryWithinWindow(
              seriesFile.series,
              windows.w0.start,
              windows.w0.end,
            );

            return [
              segment.id,
              {
                label: segment.label,
                verdict: getSegmentVerdict([
                  toVerdictWindow(wMinus2),
                  toVerdictWindow(wMinus1),
                  toVerdictWindow(w0),
                ]),
                latest: w0,
              },
            ];
          }),
        );

        return [
          community.id,
          {
            name: community.name,
            district: community.district,
            segments: segmentsReport,
          },
        ];
      }),
    ),
  };

  rmSync(paths.reportsDir, { recursive: true, force: true });
  mkdirSync(paths.reportsDir, { recursive: true });
  writeFileSync(
    resolve(paths.reportsDir, `${latestDate}.json`),
    JSON.stringify(report, null, 2),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
