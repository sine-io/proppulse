import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { DATA_DIR, resolveDataPaths } from "../lib/paths";

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

async function main(): Promise<void> {
  const { dataDir } = parseCommandLineArguments(process.argv.slice(2));
  const paths = resolveDataPaths(dataDir);

  rmSync(paths.publicDir, { recursive: true, force: true });
  mkdirSync(paths.publicDir, { recursive: true });

  if (existsSync(paths.seriesDir)) {
    cpSync(paths.seriesDir, resolve(paths.publicDir, "series"), { recursive: true });
  }

  if (existsSync(paths.reportsDir)) {
    cpSync(paths.reportsDir, resolve(paths.publicDir, "reports"), {
      recursive: true,
    });

    const latestReport = readdirSync(paths.reportsDir)
      .filter((entry) => entry.endsWith(".json"))
      .sort()
      .at(-1);

    if (latestReport) {
      writeFileSync(
        resolve(paths.publicDir, "latest-report.json"),
        readFileSync(resolve(paths.reportsDir, latestReport), "utf8"),
      );
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
