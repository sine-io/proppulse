import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

const REPO_MANUAL_DIR = resolve("data/manual");
const ISSUE_FIXTURE_PATH = resolve("tests/fixtures/issues/manual-sample.md");
const TSX_PATH = resolve("node_modules/.bin/tsx");

const temporaryRoots: string[] = [];

function makeTempDataDir(): string {
  const tempRoot = mkdtempSync(resolve(tmpdir(), "ingest-manual-issue-"));
  const dataDir = resolve(tempRoot, "data");

  mkdirSync(dataDir, { recursive: true });
  cpSync(resolve("data/config"), resolve(dataDir, "config"), { recursive: true });

  temporaryRoots.push(tempRoot);
  return dataDir;
}

function snapshotTree(root: string): Record<string, string> | null {
  if (!existsSync(root)) {
    return null;
  }

  const entries = new Map<string, string>();

  function walk(currentPath: string, relativePath: string): void {
    const stats = statSync(currentPath);

    if (stats.isDirectory()) {
      for (const entry of ["accepted", "incoming"]) {
        const nextPath = resolve(currentPath, entry);
        if (existsSync(nextPath)) {
          walk(nextPath, resolve(relativePath, entry));
        }
      }
      return;
    }

    entries.set(relativePath, readFileSync(currentPath, "utf8"));
  }

  walk(root, ".");
  return Object.fromEntries(entries);
}

describe("scripts/ingest-manual-issue.ts", () => {
  afterEach(() => {
    while (temporaryRoots.length > 0) {
      rmSync(temporaryRoots.pop()!, { recursive: true, force: true });
    }
  });

  it("writes one validated manual input JSON file from the GitHub issue form payload", () => {
    const dataDir = makeTempDataDir();
    const repoManualBefore = snapshotTree(REPO_MANUAL_DIR);
    const eventPath = resolve(dataDir, "..", "issues-event.json");

    writeFileSync(
      eventPath,
      JSON.stringify(
        {
          issue: {
            number: 321,
            created_at: "2026-03-31T09:30:00.000Z",
            body: readFileSync(ISSUE_FIXTURE_PATH, "utf8"),
          },
        },
        null,
        2,
      ),
    );

    execFileSync(
      TSX_PATH,
      [
        "scripts/ingest-manual-issue.ts",
        "--data-dir",
        dataDir,
        "--event-path",
        eventPath,
      ],
      {
        cwd: resolve("."),
        stdio: "pipe",
      },
    );

    expect(snapshotTree(REPO_MANUAL_DIR)).toEqual(repoManualBefore);

    const outputPath = resolve(dataDir, "manual", "incoming", "321.json");
    expect(existsSync(outputPath)).toBe(true);
    expect(JSON.parse(readFileSync(outputPath, "utf8"))).toEqual({
      source: "https://example.com/listings/123",
      submittedAt: "2026-03-31T09:30:00.000Z",
      samples: [
        {
          communityId: "yunshu-huayuan",
          segmentId: "2br-87-90",
          sampleAt: "2026-03-30T00:00:00.000Z",
          dealCount: 1,
          dealUnitPriceYuanPerSqm: 19_300,
        },
      ],
    });
  }, 15_000);
});
