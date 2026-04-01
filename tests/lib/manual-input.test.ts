import { describe, expect, it } from "vitest";

import { summarizeManualSamplesInDateRange, type ManualDealSample } from "../../lib/manual-input";

describe("lib/manual-input summarizeManualSamplesInDateRange", () => {
  it("includes samples exactly on the start and end boundaries and excludes samples outside the range", () => {
    const samples: ManualDealSample[] = [
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-03-24T23:59:59.999+08:00",
        dealCount: 5,
        dealUnitPriceYuanPerSqm: 9_900,
      },
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-03-25T00:00:00.000+08:00",
        dealCount: 1,
        dealUnitPriceYuanPerSqm: 10_000,
      },
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-03-31T23:59:59.999+08:00",
        dealCount: 2,
        dealUnitPriceYuanPerSqm: 10_400,
      },
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-04-01T00:00:00.000+08:00",
        dealCount: 7,
        dealUnitPriceYuanPerSqm: 10_800,
      },
      {
        communityId: "other-community",
        segmentId: "2br-87-90",
        sampleAt: "2026-03-29T12:00:00.000+08:00",
        dealCount: 9,
        dealUnitPriceYuanPerSqm: 12_000,
      },
    ];

    expect(
      summarizeManualSamplesInDateRange(
        samples,
        "yunshu-huayuan",
        "2br-87-90",
        "2026-03-25",
        "2026-03-31",
      ),
    ).toEqual({
      manualDealCount: 3,
      manualDealUnitPriceMedian: 10_200,
      manualLatestSampleAt: "2026-03-31T23:59:59.999+08:00",
    });
  });

  it("buckets samples by Tianjin local calendar day instead of raw UTC boundaries", () => {
    const samples: ManualDealSample[] = [
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-03-30T23:55:00.000+08:00",
        dealCount: 9,
        dealUnitPriceYuanPerSqm: 9_900,
      },
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-03-31T00:15:00.000+08:00",
        dealCount: 1,
        dealUnitPriceYuanPerSqm: 10_000,
      },
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-03-31T23:50:00.000+08:00",
        dealCount: 2,
        dealUnitPriceYuanPerSqm: 10_200,
      },
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-04-01T00:00:00.000+08:00",
        dealCount: 7,
        dealUnitPriceYuanPerSqm: 11_000,
      },
    ];

    expect(
      summarizeManualSamplesInDateRange(
        samples,
        "yunshu-huayuan",
        "2br-87-90",
        "2026-03-31",
        "2026-03-31",
      ),
    ).toEqual({
      manualDealCount: 3,
      manualDealUnitPriceMedian: 10_100,
      manualLatestSampleAt: "2026-03-31T23:50:00.000+08:00",
    });
  });

  it("chooses the latest matching sample by timestamp instead of ISO string order", () => {
    const samples: ManualDealSample[] = [
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-03-31T00:15:00.000+01:00",
        dealCount: 1,
        dealUnitPriceYuanPerSqm: 10_000,
      },
      {
        communityId: "yunshu-huayuan",
        segmentId: "2br-87-90",
        sampleAt: "2026-03-30T23:30:00.000Z",
        dealCount: 2,
        dealUnitPriceYuanPerSqm: 10_200,
      },
    ];

    expect(
      summarizeManualSamplesInDateRange(
        samples,
        "yunshu-huayuan",
        "2br-87-90",
        "2026-03-30",
        "2026-03-31",
      ),
    ).toEqual({
      manualDealCount: 3,
      manualDealUnitPriceMedian: 10_100,
      manualLatestSampleAt: "2026-03-30T23:30:00.000Z",
    });
  });
});
