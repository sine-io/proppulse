import { inventoryDelta, percentageChange } from "./metrics";

export type CityMarketVerdict = "偏强" | "中性" | "偏弱";
export type SegmentVerdict =
  | "上涨"
  | "下跌"
  | "横盘"
  | "以价换量"
  | "假回暖"
  | "样本不足";

export interface SegmentVerdictWindow {
  listingUnitPriceMedian: number | null;
  listingUnitPriceMin: number | null;
  listingsCount: number;
  suspectedDealCount?: number | null;
  manualDealCount?: number | null;
}

function hasComparableListingMetrics(
  window: SegmentVerdictWindow,
): boolean {
  return (
    window.listingUnitPriceMedian !== null &&
    window.listingUnitPriceMin !== null &&
    Number.isFinite(window.listingUnitPriceMedian) &&
    Number.isFinite(window.listingUnitPriceMin)
  );
}

function didCountRise(
  previous: number | null | undefined,
  next: number | null | undefined,
): boolean {
  return (next ?? 0) > (previous ?? 0);
}

export function getCityMarketVerdict(
  secondaryHomePriceIndexMom: number,
): CityMarketVerdict {
  if (secondaryHomePriceIndexMom >= 100) {
    return "偏强";
  }

  if (secondaryHomePriceIndexMom >= 99.8) {
    return "中性";
  }

  return "偏弱";
}

export function getSegmentVerdict(
  [wMinus2, wMinus1, w0]: [
    SegmentVerdictWindow,
    SegmentVerdictWindow,
    SegmentVerdictWindow,
  ],
): SegmentVerdict {
  if (
    [wMinus2, wMinus1, w0].some(
      (window) => window.listingsCount < 3 || !hasComparableListingMetrics(window),
    )
  ) {
    return "样本不足";
  }

  const priorPriceChange = percentageChange(
    wMinus2.listingUnitPriceMedian,
    wMinus1.listingUnitPriceMedian,
  );
  const latestPriceChange = percentageChange(
    wMinus1.listingUnitPriceMedian,
    w0.listingUnitPriceMedian,
  );
  const latestMinPriceChange = percentageChange(
    wMinus1.listingUnitPriceMin,
    w0.listingUnitPriceMin,
  );
  const latestInventoryDelta = inventoryDelta(
    wMinus1.listingsCount,
    w0.listingsCount,
  );

  if (
    priorPriceChange !== null &&
    latestPriceChange !== null &&
    latestMinPriceChange !== null &&
    priorPriceChange >= 2 &&
    latestPriceChange >= 2 &&
    latestInventoryDelta.isFall &&
    latestMinPriceChange >= 3
  ) {
    return "上涨";
  }

  if (
    priorPriceChange !== null &&
    latestPriceChange !== null &&
    latestMinPriceChange !== null &&
    priorPriceChange <= -2 &&
    latestPriceChange <= -2 &&
    latestInventoryDelta.isRise &&
    latestMinPriceChange <= -3
  ) {
    return "下跌";
  }

  if (
    latestPriceChange !== null &&
    Math.abs(latestPriceChange) < 2 &&
    !latestInventoryDelta.isSignificant
  ) {
    return "横盘";
  }

  if (
    latestPriceChange !== null &&
    latestPriceChange <= -2 &&
    (didCountRise(wMinus1.suspectedDealCount, w0.suspectedDealCount) ||
      didCountRise(wMinus1.manualDealCount, w0.manualDealCount))
  ) {
    return "以价换量";
  }

  if (
    latestPriceChange !== null &&
    latestMinPriceChange !== null &&
    latestPriceChange >= 2 &&
    !latestInventoryDelta.isFall &&
    latestMinPriceChange < 3
  ) {
    return "假回暖";
  }

  return "横盘";
}
