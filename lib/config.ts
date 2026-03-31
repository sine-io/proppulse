import { readFileSync } from "node:fs";

import { communitiesSchema, segmentsSchema } from "./schemas";
import { COMMUNITIES_CONFIG_PATH, SEGMENTS_CONFIG_PATH } from "./paths";
import type { Community, SegmentTemplate } from "./types";

function readJsonFile(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function loadCommunities(
  filePath: string = COMMUNITIES_CONFIG_PATH,
): Community[] {
  return communitiesSchema.parse(readJsonFile(filePath));
}

export function loadSegments(
  filePath: string = SEGMENTS_CONFIG_PATH,
): SegmentTemplate[] {
  return segmentsSchema.parse(readJsonFile(filePath));
}
