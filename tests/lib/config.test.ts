import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { loadCommunities, loadSegments } from "../../lib/config";

const temporaryDirectories: string[] = [];

function writeJsonFixture(fileName: string, data: unknown): string {
  const directory = mkdtempSync(join(tmpdir(), "config-test-"));
  const filePath = join(directory, fileName);

  writeFileSync(filePath, JSON.stringify(data), "utf8");
  temporaryDirectories.push(directory);

  return filePath;
}

afterEach(() => {
  while (temporaryDirectories.length > 0) {
    const directory = temporaryDirectories.pop();

    if (directory) {
      rmSync(directory, { force: true, recursive: true });
    }
  }
});

describe("loadCommunities", () => {
  it("returns the frozen community contract", () => {
    const communities = loadCommunities();

    expect(communities.map((community) => community.id)).toEqual([
      "mingquan-huayuan",
      "jiajun-huayuan",
      "yunshu-huayuan",
      "boxi-huayuan",
      "haiyi-changzhou-hanboyuan",
    ]);

    expect(communities[0]).toMatchObject({
      id: "mingquan-huayuan",
      city: "天津",
      district: "西青",
      sources: {
        fangCommunityUrl: "https://tj.esf.fang.com/loupan/1110750643.htm",
        fangWeekreportUrl:
          "https://tj.esf.fang.com/loupan/1110750643/weekreport.htm",
      },
    });

    expect(communities[4]).toMatchObject({
      id: "haiyi-changzhou-hanboyuan",
      sources: {
        fangCommunityUrl: "https://tj.esf.fang.com/loupan/1110676739.htm",
        fangWeekreportUrl:
          "https://tj.esf.fang.com/loupan/1110676739/weekreport.htm",
      },
    });
  });

  it("rejects duplicate community ids at load time", () => {
    const fixturePath = writeJsonFixture("communities.json", [
      {
        id: "duplicate-community",
        name: "社区一",
        city: "天津",
        district: "西青",
        sources: {
          fangCommunityUrl: "https://example.com/community-1",
          fangWeekreportUrl: "https://example.com/community-1/weekreport",
        },
      },
      {
        id: "duplicate-community",
        name: "社区二",
        city: "天津",
        district: "西青",
        sources: {
          fangCommunityUrl: "https://example.com/community-2",
          fangWeekreportUrl: "https://example.com/community-2/weekreport",
        },
      },
    ]);

    expect(() => loadCommunities(fixturePath)).toThrow(/Duplicate community id/);
  });
});

describe("loadSegments", () => {
  it("returns the frozen segment contract", () => {
    const segments = loadSegments();

    expect(segments.map((segment) => segment.id)).toEqual([
      "2br-87-90",
      "3br-140-150",
    ]);

    expect(segments).toEqual([
      {
        id: "2br-87-90",
        label: "两居 87-90㎡",
        rooms: 2,
        areaMin: 87,
        areaMax: 90,
      },
      {
        id: "3br-140-150",
        label: "三居 140-150㎡",
        rooms: 3,
        areaMin: 140,
        areaMax: 150,
      },
    ]);
  });

  it("rejects duplicate segment ids at load time", () => {
    const fixturePath = writeJsonFixture("segments.json", [
      {
        id: "duplicate-segment",
        label: "两居 87-90㎡",
        rooms: 2,
        areaMin: 87,
        areaMax: 90,
      },
      {
        id: "duplicate-segment",
        label: "三居 140-150㎡",
        rooms: 3,
        areaMin: 140,
        areaMax: 150,
      },
    ]);

    expect(() => loadSegments(fixturePath)).toThrow(/Duplicate segment id/);
  });
});
