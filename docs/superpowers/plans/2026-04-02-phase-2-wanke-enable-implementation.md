# Phase 2 Wanke Enable Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable `万科东第` as an automatically collected community via `anjuke_sale_search`, switch its primary monitored segment to `2居 85–90㎡`, and keep `恋海园` / `谊景村` in `pending_verification` without breaking the existing phase-1 pipeline.

**Architecture:** Keep the existing run-artifact and series/report/frontend architecture unchanged downstream. The only new runtime branch is at config validation and `scripts/collect.ts`: communities dispatch by `sourceProvider`, but every provider must still normalize into the existing `fangCommunity` / `fangWeekreport` community artifact shape so `build-series.ts`, `build-weekly-report.ts`, and the site keep working.

**Tech Stack:** Node.js, TypeScript, Zod, Vitest, Playwright, Vite, React, JSON config/data pipeline, GitHub Actions

---

## File Structure Lock-In

### Config and schema layer

- Modify: `data/config/communities.json`
- Modify: `data/config/segments.json`
- Modify: `lib/types.ts`
- Modify: `lib/schemas.ts`
- Modify: `lib/config.ts`
- Test: `tests/lib/config.test.ts`

### Manual-input and issue-form compatibility

- Modify: `.github/ISSUE_TEMPLATE/manual-sample.yml`
- Modify: `lib/manual-input.ts`
- Modify: `scripts/ingest-manual-issue.ts`
- Modify: `scripts/promote-manual-inputs.ts`
- Test: `tests/lib/manual-input.test.ts`
- Test: `tests/scripts/ingest-manual-issue.test.ts`
- Test: `tests/scripts/promote-manual-inputs.test.ts`
- Check data dir: `data/manual/incoming/`
- Check data dir: `data/manual/accepted/`

### Anjuke provider implementation

- Create: `collector/anjuke-sale-search.ts`
- Create: `parser/anjuke-sale-search.ts`
- Create: `tests/fixtures/anjuke/sale-search/wanke-dongdi.html`
- Create: `tests/fixtures/anjuke/sale-search/wanke-dongdi-empty.html`
- Create: `tests/fixtures/anjuke/sale-search/wanke-dongdi-blocked.html`
- Create: `tests/parser/anjuke-sale-search.test.ts`
- Test: `tests/scripts/collect.test.ts`

### Pipeline integration

- Modify: `scripts/collect.ts`
- Modify: `scripts/build-series.ts` only if tests prove a code change is needed for `community-fallback` handling
- Test: `tests/scripts/collect.test.ts`
- Test: `tests/scripts/build-series.test.ts`
- Test: `tests/scripts/build-weekly-report.test.ts`

### Frontend and release verification

- Modify: `tests/site/load-json.test.ts`
- Modify: `tests/site/app.test.tsx`
- Modify: `tests/e2e/site-smoke.spec.ts`
- Generate: `data/runs/*.json`
- Generate: `data/series/communities/wanke-dongdi/wanke-2br-85-90.json`
- Generate: `data/reports/*.json`
- Generate: `site/public/data/**`

## Frozen Phase-2 Runtime Contract

### Communities

Use this exact phase-2 target:

```json
[
  {
    "id": "mingquan-huayuan",
    "name": "鸣泉花园",
    "city": "天津",
    "district": "西青",
    "status": "active",
    "sourceProvider": "fang_mobile",
    "sources": {
      "fangCommunityUrl": "https://tj.esf.fang.com/loupan/1110750643.htm",
      "fangWeekreportUrl": "https://tj.esf.fang.com/loupan/1110750643/weekreport.htm",
      "anjukeSaleSearchUrl": null
    }
  },
  {
    "id": "boxi-huayuan",
    "name": "柏溪花园",
    "city": "天津",
    "district": "西青",
    "status": "active",
    "sourceProvider": "fang_mobile",
    "sources": {
      "fangCommunityUrl": "https://tj.esf.fang.com/loupan/1110661679.htm",
      "fangWeekreportUrl": "https://tj.esf.fang.com/loupan/1110661679/weekreport.htm",
      "anjukeSaleSearchUrl": null
    }
  },
  {
    "id": "wanke-dongdi",
    "name": "万科东第",
    "city": "天津",
    "district": "待确认",
    "status": "active",
    "sourceProvider": "anjuke_sale_search",
    "sources": {
      "fangCommunityUrl": null,
      "fangWeekreportUrl": null,
      "anjukeSaleSearchUrl": "https://m.anjuke.com/tj/sale/?kw=%E4%B8%87%E7%A7%91%E4%B8%9C%E7%AC%AC"
    }
  },
  {
    "id": "lianhai-yuan",
    "name": "恋海园",
    "city": "天津",
    "district": "待确认",
    "status": "pending_verification",
    "sourceProvider": "none",
    "sources": {
      "fangCommunityUrl": null,
      "fangWeekreportUrl": null,
      "anjukeSaleSearchUrl": null
    }
  },
  {
    "id": "yijing-cun",
    "name": "谊景村",
    "city": "天津",
    "district": "待确认",
    "status": "pending_verification",
    "sourceProvider": "none",
    "sources": {
      "fangCommunityUrl": null,
      "fangWeekreportUrl": null,
      "anjukeSaleSearchUrl": null
    }
  }
]
```

### Segments

Use this exact phase-2 target:

```json
[
  {
    "communityId": "mingquan-huayuan",
    "id": "mingquan-2br-87-90",
    "label": "2居 87-90㎡",
    "rooms": 2,
    "areaMin": 87,
    "areaMax": 90
  },
  {
    "communityId": "boxi-huayuan",
    "id": "boxi-2br-100-120",
    "label": "2居 100-120㎡",
    "rooms": 2,
    "areaMin": 100,
    "areaMax": 120
  },
  {
    "communityId": "wanke-dongdi",
    "id": "wanke-2br-85-90",
    "label": "2居 85-90㎡",
    "rooms": 2,
    "areaMin": 85,
    "areaMax": 90
  },
  {
    "communityId": "lianhai-yuan",
    "id": "lianhai-2br-90-110",
    "label": "2居 90-110㎡",
    "rooms": 2,
    "areaMin": 90,
    "areaMax": 110
  },
  {
    "communityId": "yijing-cun",
    "id": "yijing-2br-75-90",
    "label": "2居 75-90㎡",
    "rooms": 2,
    "areaMin": 75,
    "areaMax": 90
  }
]
```

### Provider Rules

- `active + fang_mobile`
  - `fangCommunityUrl` required
  - `fangWeekreportUrl` required
  - `anjukeSaleSearchUrl` must be `null`
- `active + anjuke_sale_search`
  - `anjukeSaleSearchUrl` required
  - `fangCommunityUrl` may be `null`
  - `fangWeekreportUrl` may be `null`
- `pending_verification + none`
  - all source URLs must be `null`
- `sourceProvider` is required
- `sources` must contain exactly:
  - `fangCommunityUrl`
  - `fangWeekreportUrl`
  - `anjukeSaleSearchUrl`
- unknown providers must fail fast during config load

### Run Artifact Rules

- `anjuke_sale_search` still writes into:
  - `communities[communityId].fangCommunity`
  - `communities[communityId].fangWeekreport`
- For `wanke-dongdi`:
  - `fangCommunity.status` becomes `success` or `failed`
  - `fangCommunity.currentListingTeasers` holds normalized search-result teasers
  - `fangCommunity.listingCount` is the deduplicated teaser count
  - `fangCommunity.referenceUnitPrice` is the teaser-derived median or explicit `null`
  - `fangWeekreport.status` stays `skipped`
  - `fangWeekreport.pricePoints` stays empty or omitted
- Downstream behavior is explicit:
  - `>= 3` matched Wanke teasers for `2居 85–90㎡` => `segment-teasers`
  - `< 3` matched teasers => `community-fallback`
  - because no weekreport fallback exists, `listingUnitPriceMedian` may remain `null`

### Manual-Input Compatibility Rules

- New issue-form option must be `2居 85-90㎡ (wanke-2br-85-90)`
- Old `wanke-3br-100-105` must not be auto-remapped
- If any `data/manual/incoming/*.json` or `data/manual/accepted/*.json` still reference `wanke-3br-100-105`, remove them from the build path before regenerating data

## Task 1: Extend Config and Schema for Provider-Aware Communities

**Files:**
- Modify: `data/config/communities.json`
- Modify: `data/config/segments.json`
- Modify: `lib/types.ts`
- Modify: `lib/schemas.ts`
- Modify: `lib/config.ts`
- Test: `tests/lib/config.test.ts`

- [ ] **Step 1: Write failing config/schema tests**

Cover these assertions in `tests/lib/config.test.ts`:

- `sourceProvider` is required on every community
- `sources` must contain exactly three keys with explicit `null`s where unused
- `wanke-dongdi` is `active + anjuke_sale_search`
- `wanke-dongdi` segment is exactly `wanke-2br-85-90`
- unknown provider or invalid provider/status combinations are rejected

- [ ] **Step 2: Run the config test and confirm failure**

Run:

```bash
npm run test -- tests/lib/config.test.ts
```

Expected: FAIL because current types/schemas/config do not yet accept provider-aware rules.

- [ ] **Step 3: Implement the new provider-aware config contract**

Update `lib/types.ts`, `lib/schemas.ts`, `lib/config.ts`, `data/config/communities.json`, and `data/config/segments.json` to match the frozen contract above.

- [ ] **Step 4: Re-run config tests and typecheck**

Run:

```bash
npm run test -- tests/lib/config.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/config lib tests/lib/config.test.ts
git commit -m "feat: add provider-aware community config"
```

## Task 2: Switch Wanke Segment and Manual-Input Canonical Options

**Files:**
- Modify: `.github/ISSUE_TEMPLATE/manual-sample.yml`
- Modify: `lib/manual-input.ts`
- Modify: `scripts/ingest-manual-issue.ts`
- Modify: `scripts/promote-manual-inputs.ts`
- Test: `tests/lib/manual-input.test.ts`
- Test: `tests/scripts/ingest-manual-issue.test.ts`
- Test: `tests/scripts/promote-manual-inputs.test.ts`

- [ ] **Step 1: Write failing tests for Wanke segment compatibility**

Add or update tests to assert:

- `wanke-2br-85-90` is accepted for `wanke-dongdi`
- `wanke-3br-100-105` is rejected everywhere manual-input validation runs
- the issue-form segment dropdown uses the new Wanke option
- ingest/promote reject files whose `communityId` is `wanke-dongdi` but whose `segmentId` is the old 3-bedroom segment

- [ ] **Step 2: Run the manual-input test set and confirm failure**

Run:

```bash
npm run test -- tests/lib/manual-input.test.ts tests/scripts/ingest-manual-issue.test.ts tests/scripts/promote-manual-inputs.test.ts
```

Expected: FAIL because current canonical Wanke segment is still the old one.

- [ ] **Step 3: Update canonical manual-input options and validation**

Update the issue template and validation path to use `wanke-2br-85-90` as the only valid Wanke segment.

- [ ] **Step 4: Check for old Wanke manual artifacts before continuing**

Run:

```bash
rg -n "wanke-3br-100-105" data/manual/incoming data/manual/accepted
```

Expected:

- ideally no output
- if output exists, move or delete those files before any generated-data refresh so the old segment cannot leak into the new build

- [ ] **Step 5: Re-run the manual-input tests**

Run:

```bash
npm run test -- tests/lib/manual-input.test.ts tests/scripts/ingest-manual-issue.test.ts tests/scripts/promote-manual-inputs.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .github/ISSUE_TEMPLATE/manual-sample.yml lib/manual-input.ts scripts/ingest-manual-issue.ts scripts/promote-manual-inputs.ts tests/lib/manual-input.test.ts tests/scripts/ingest-manual-issue.test.ts tests/scripts/promote-manual-inputs.test.ts
git commit -m "fix: update wanke manual segment contract"
```

## Task 3: Add the Anjuke Search Parser and Fixture

**Files:**
- Create: `collector/anjuke-sale-search.ts`
- Create: `parser/anjuke-sale-search.ts`
- Create: `tests/fixtures/anjuke/sale-search/wanke-dongdi.html`
- Create: `tests/fixtures/anjuke/sale-search/wanke-dongdi-empty.html`
- Create: `tests/fixtures/anjuke/sale-search/wanke-dongdi-blocked.html`
- Create: `tests/parser/anjuke-sale-search.test.ts`

- [ ] **Step 1: Write failing parser tests for deterministic Wanke acceptance**

Cover these assertions:

- only normalized exact `万科东第` matches survive
- fuzzy matches like `万科` or unrelated nearby communities are excluded
- duplicate search cards collapse by `标题 + 房间数 + 面积 + 总价`
- incomplete cards lacking room count, area, total price, or unit price are dropped
- empty-result HTML is recognized as “no valid listings” input for the caller
- anti-bot / blocked HTML is recognized as parse failure input for the caller

- [ ] **Step 2: Run the parser test and confirm failure**

Run:

```bash
npm run test -- tests/parser/anjuke-sale-search.test.ts
```

Expected: FAIL because the parser and fixture do not exist yet.

- [ ] **Step 3: Add the fixture and implement the parser/collector helper**

Create the fixture from a real search-result page and implement:

- a parser that extracts:
  - title
  - room count
  - area
  - total price
  - unit price
  - detail link
- a collector helper that can fetch the live URL or load the fixture when `--fixture` is used
- blocked and empty fixtures that let `tests/scripts/collect.test.ts` assert `status = failed`

- [ ] **Step 4: Re-run the parser test**

Run:

```bash
npm run test -- tests/parser/anjuke-sale-search.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add collector/anjuke-sale-search.ts parser/anjuke-sale-search.ts tests/fixtures/anjuke/sale-search/wanke-dongdi.html tests/fixtures/anjuke/sale-search/wanke-dongdi-empty.html tests/fixtures/anjuke/sale-search/wanke-dongdi-blocked.html tests/parser/anjuke-sale-search.test.ts
git commit -m "feat: add anjuke search parser for wanke"
```

## Task 4: Integrate Provider Dispatch into Collection and Validate Downstream Behavior

**Files:**
- Modify: `scripts/collect.ts`
- Modify: `tests/scripts/collect.test.ts`
- Modify: `tests/scripts/build-series.test.ts`
- Modify: `tests/scripts/build-weekly-report.test.ts`
- Modify if required by failing tests: `scripts/build-series.ts`

- [ ] **Step 1: Write failing collection and series tests**

Cover these assertions:

- `wanke-dongdi` dispatches to `anjuke_sale_search`
- `lianhai-yuan` and `yijing-cun` still produce `skipped`
- successful Wanke collection writes teasers into `communities.wanke-dongdi.fangCommunity.currentListingTeasers`
- successful Wanke collection writes `fangCommunity.listingCount`
- successful Wanke collection writes `fangCommunity.referenceUnitPrice` or explicit `null`
- `communities.wanke-dongdi.fangWeekreport.status` stays `skipped`
- empty-result and blocked fixtures set `communities.wanke-dongdi.fangCommunity.status = failed`
- when fewer than 3 matching Wanke teasers exist, `build-series.ts` yields predictable `community-fallback` output with `listingUnitPriceMedian = null`

- [ ] **Step 2: Run the collection/pipeline tests and confirm failure**

Run:

```bash
npm run test -- tests/scripts/collect.test.ts tests/scripts/build-series.test.ts tests/scripts/build-weekly-report.test.ts
```

Expected: FAIL because `scripts/collect.ts` only knows Fang today.

- [ ] **Step 3: Implement provider dispatch in `scripts/collect.ts`**

Wire `sourceProvider` handling so:

- `fang_mobile` continues existing behavior
- `anjuke_sale_search` collects from `sources.anjukeSaleSearchUrl`
- normalized result writes into the existing `fangCommunity` / `fangWeekreport` slots
- `none` still skips collection

- [ ] **Step 4: Only if tests require it, make the minimal downstream change**

If the new artifact shape exposes a strict assumption in `scripts/build-series.ts`, patch only that assumption. Do not redesign the series model.

- [ ] **Step 5: Re-run collection/pipeline tests**

Run:

```bash
npm run test -- tests/scripts/collect.test.ts tests/scripts/build-series.test.ts tests/scripts/build-weekly-report.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/collect.ts scripts/build-series.ts tests/scripts/collect.test.ts tests/scripts/build-series.test.ts tests/scripts/build-weekly-report.test.ts
git commit -m "feat: collect wanke from anjuke search"
```

## Task 5: Verify Frontend, Regenerate Data, and Ship

**Files:**
- Modify: `tests/site/load-json.test.ts`
- Modify: `tests/site/app.test.tsx`
- Modify: `tests/e2e/site-smoke.spec.ts`
- Generate: `data/runs/*.json`
- Generate: `data/series/**`
- Generate: `data/reports/*.json`
- Generate: `site/public/data/**`

- [ ] **Step 1: Update failing UI assertions**

Add or update tests to assert:

- generated public `communities.json` still loads when `sourceProvider` and three-key `sources` are present
- `万科东第` no longer renders as `待复核`
- `万科东第` now renders `2居 85-90㎡`
- `恋海园` and `谊景村` still render `待复核`

- [ ] **Step 2: Run the UI tests and confirm failure**

Run:

```bash
npm run test -- tests/site/load-json.test.ts
npm run test -- tests/site/app.test.tsx
npm run test:e2e -- tests/e2e/site-smoke.spec.ts
```

Expected: at least one assertion FAILS before data/code are refreshed.

- [ ] **Step 3: Refresh generated data with the new Wanke source**

Run:

```bash
npm run collect -- --fixture
npm run build:data
```

Expected:

- a run artifact that contains active `wanke-dongdi` output
- regenerated Wanke series under `data/series/communities/wanke-dongdi/wanke-2br-85-90.json`
- refreshed weekly report and `site/public/data/**`

- [ ] **Step 4: Re-run full local verification**

Run:

```bash
npm run test
npm run typecheck
npm run build
npm run test:e2e -- tests/e2e/site-smoke.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit generated data and verification-aligned test updates**

```bash
git add tests/site/load-json.test.ts tests/site/app.test.tsx tests/e2e/site-smoke.spec.ts data site/public/data
git commit -m "feat: enable wanke monitoring in phase 2"
```

- [ ] **Step 6: Push and verify remote automation**

Run:

```bash
git push origin main
gh run list --workflow collect.yml --limit 5
gh run list --workflow deploy-pages.yml --limit 5
```

Expected:

- push succeeds
- `Collect` eventually succeeds
- `Deploy Pages` eventually succeeds after the update
