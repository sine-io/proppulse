export const RECOMMENDATION_RESULT_SCHEMA_VERSION = 1;

export type RecommendationAction =
  | "continue_wait"
  | "can_view"
  | "can_negotiate";

export type BlockingReasonCode =
  | "invalid_input"
  | "stale_anchor"
  | "insufficient_evidence"
  | "contradictory_signal";

export interface RecommendationEvidenceItem {
  label: string;
  summary: string;
  value?: string;
}

export interface TargetBasketRankingEntry {
  communityId: string;
  score: number;
  reasoning: string;
}

export interface RecommendationExplanation {
  strongestSupport: RecommendationEvidenceItem[];
  strongestCounterevidence: RecommendationEvidenceItem[];
  flipConditions: RecommendationEvidenceItem[];
}

export interface RecommendationTrace {
  matchedRuleIds: string[];
  blockingChecks: Array<{
    reasonCode: BlockingReasonCode;
    triggered: boolean;
  }>;
  notes: string[];
}

export interface RecommendationResult {
  schemaVersion: typeof RECOMMENDATION_RESULT_SCHEMA_VERSION;
  householdId: string;
  configVersion: string;
  sourceSnapshotId: string;
  generatedAt: string;
  blocking: {
    isBlocked: boolean;
    reasonCode: BlockingReasonCode | null;
  };
  action: RecommendationAction | null;
  explanation: RecommendationExplanation;
  basketRanking: TargetBasketRankingEntry[];
  trace: RecommendationTrace;
}
