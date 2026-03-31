import { describe, expect, it } from "vitest";

import {
  getCityMarketVerdict,
  getSegmentVerdict,
  type SegmentVerdictWindow,
} from "../../lib/verdicts";

function makeWindow(
  overrides: Partial<SegmentVerdictWindow> = {},
): SegmentVerdictWindow {
  return {
    listingUnitPriceMedian: 10_000,
    listingUnitPriceMin: 9_500,
    listingsCount: 8,
    suspectedDealCount: 0,
    manualDealCount: 0,
    ...overrides,
  };
}

describe("lib/verdicts", () => {
  describe("getCityMarketVerdict", () => {
    it("returns 偏强 when the secondary-home index is at least 100.0", () => {
      expect(getCityMarketVerdict(100.0)).toBe("偏强");
      expect(getCityMarketVerdict(100.2)).toBe("偏强");
    });

    it("returns 中性 when the secondary-home index is between 99.8 and 100.0", () => {
      expect(getCityMarketVerdict(99.8)).toBe("中性");
      expect(getCityMarketVerdict(99.99)).toBe("中性");
    });

    it("returns 偏弱 when the secondary-home index is below 99.8", () => {
      expect(getCityMarketVerdict(99.79)).toBe("偏弱");
    });
  });

  describe("getSegmentVerdict", () => {
    it("returns 上涨 when prices rise for two consecutive windows, inventory falls, and the floor listing price rises", () => {
      expect(
        getSegmentVerdict([
          makeWindow({
            listingUnitPriceMedian: 10_000,
            listingUnitPriceMin: 9_500,
            listingsCount: 10,
          }),
          makeWindow({
            listingUnitPriceMedian: 10_200,
            listingUnitPriceMin: 9_700,
            listingsCount: 8,
          }),
          makeWindow({
            listingUnitPriceMedian: 10_450,
            listingUnitPriceMin: 10_050,
            listingsCount: 6,
          }),
        ]),
      ).toBe("上涨");
    });

    it("returns 下跌 when prices fall for two consecutive windows, inventory rises, and the floor listing price falls", () => {
      expect(
        getSegmentVerdict([
          makeWindow({
            listingUnitPriceMedian: 10_000,
            listingUnitPriceMin: 9_800,
            listingsCount: 8,
          }),
          makeWindow({
            listingUnitPriceMedian: 9_800,
            listingUnitPriceMin: 9_700,
            listingsCount: 8,
          }),
          makeWindow({
            listingUnitPriceMedian: 9_500,
            listingUnitPriceMin: 9_300,
            listingsCount: 10,
          }),
        ]),
      ).toBe("下跌");
    });

    it("returns 横盘 when the latest price change is below 2% and the inventory change is not significant", () => {
      expect(
        getSegmentVerdict([
          makeWindow({
            listingUnitPriceMedian: 10_100,
            listingUnitPriceMin: 9_600,
            listingsCount: 20,
          }),
          makeWindow({
            listingUnitPriceMedian: 10_000,
            listingUnitPriceMin: 9_500,
            listingsCount: 20,
          }),
          makeWindow({
            listingUnitPriceMedian: 10_150,
            listingUnitPriceMin: 9_520,
            listingsCount: 21,
          }),
        ]),
      ).toBe("横盘");
    });

    it("returns 以价换量 when the latest listing median drops by at least 2% and suspected deals rise", () => {
      expect(
        getSegmentVerdict([
          makeWindow({
            listingUnitPriceMedian: 10_300,
            listingUnitPriceMin: 9_800,
            listingsCount: 9,
            suspectedDealCount: 1,
          }),
          makeWindow({
            listingUnitPriceMedian: 10_000,
            listingUnitPriceMin: 9_700,
            listingsCount: 9,
            suspectedDealCount: 1,
          }),
          makeWindow({
            listingUnitPriceMedian: 9_700,
            listingUnitPriceMin: 9_500,
            listingsCount: 9,
            suspectedDealCount: 3,
          }),
        ]),
      ).toBe("以价换量");
    });

    it("returns 假回暖 when the latest listing median rises by at least 2% without inventory falling and without the floor listing price moving up materially", () => {
      expect(
        getSegmentVerdict([
          makeWindow({
            listingUnitPriceMedian: 9_800,
            listingUnitPriceMin: 9_400,
            listingsCount: 8,
          }),
          makeWindow({
            listingUnitPriceMedian: 10_000,
            listingUnitPriceMin: 9_500,
            listingsCount: 8,
          }),
          makeWindow({
            listingUnitPriceMedian: 10_250,
            listingUnitPriceMin: 9_650,
            listingsCount: 8,
          }),
        ]),
      ).toBe("假回暖");
    });

    it("returns 样本不足 when any compared window has fewer than three listings", () => {
      expect(
        getSegmentVerdict([
          makeWindow({
            listingUnitPriceMedian: 10_000,
            listingUnitPriceMin: 9_500,
            listingsCount: 2,
          }),
          makeWindow({
            listingUnitPriceMedian: 10_200,
            listingUnitPriceMin: 9_800,
            listingsCount: 6,
          }),
          makeWindow({
            listingUnitPriceMedian: 10_500,
            listingUnitPriceMin: 10_100,
            listingsCount: 4,
          }),
        ]),
      ).toBe("样本不足");
    });
  });
});
