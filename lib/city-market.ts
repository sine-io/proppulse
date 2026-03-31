import { getCityMarketVerdict, type CityMarketVerdict } from "./verdicts";

export interface CityMarketRunSource {
  latestMonth?: string;
  city?: string;
  secondaryHomePriceIndexMom?: number | null;
  secondaryHomePriceIndexYoy?: number | null;
}

export interface CityMarketSeriesEntry {
  date: string;
  generatedAt: string;
  sourceMonth: string;
  secondaryHomePriceIndexMom: number;
  secondaryHomePriceIndexYoy: number;
  verdict: CityMarketVerdict;
}

const CITY_SLUGS = new Map<string, string>([
  ["天津", "tianjin"],
  ["Tianjin", "tianjin"],
]);

export function citySlug(city: string): string {
  return (
    CITY_SLUGS.get(city) ??
    city
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

export function buildCityMarketSeriesEntry(
  generatedAt: string,
  source: CityMarketRunSource | undefined,
): CityMarketSeriesEntry | null {
  if (
    !source?.latestMonth ||
    source.secondaryHomePriceIndexMom === null ||
    source.secondaryHomePriceIndexMom === undefined ||
    source.secondaryHomePriceIndexYoy === null ||
    source.secondaryHomePriceIndexYoy === undefined
  ) {
    return null;
  }

  return {
    date: generatedAt.slice(0, 10),
    generatedAt,
    sourceMonth: source.latestMonth,
    secondaryHomePriceIndexMom: source.secondaryHomePriceIndexMom,
    secondaryHomePriceIndexYoy: source.secondaryHomePriceIndexYoy,
    verdict: getCityMarketVerdict(source.secondaryHomePriceIndexMom),
  };
}
