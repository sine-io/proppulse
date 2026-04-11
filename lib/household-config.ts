import { z } from "zod";

export const HOUSEHOLD_CONFIG_SCHEMA_VERSION = 1;
export const DEFAULT_ANCHOR_STALE_AFTER_DAYS = 90;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const isoDateTimeSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Expected an ISO-8601 datetime string",
});

const householdIdSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, {
    message: "Expected a kebab-case household id",
  });

const targetBasketEntrySchema = z
  .object({
    communityId: z.string().trim().min(1),
    weight: z.number().positive().max(1).optional(),
  })
  .strict();

const currentHomeSchema = z
  .object({
    anchorPriceWan: z.number().min(10).max(5000),
    anchorUpdatedAt: isoDateTimeSchema,
  })
  .strict();

export const householdConfigSchema = z
  .object({
    schemaVersion: z.literal(HOUSEHOLD_CONFIG_SCHEMA_VERSION),
    householdId: householdIdSchema,
    configVersion: z.string().trim().min(1),
    updatedAt: isoDateTimeSchema,
    currentHome: currentHomeSchema,
    targetBasket: z.array(targetBasketEntrySchema).min(1),
    decisionWindowMonths: z.union([z.literal(3), z.literal(6), z.literal(12)]),
  })
  .strict()
  .superRefine((value, context) => {
    const seenCommunityIds = new Set<string>();

    for (const [index, entry] of value.targetBasket.entries()) {
      if (seenCommunityIds.has(entry.communityId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate target basket communityId: ${entry.communityId}`,
          path: ["targetBasket", index, "communityId"],
        });
      }

      seenCommunityIds.add(entry.communityId);
    }
  });

export type HouseholdConfig = z.infer<typeof householdConfigSchema>;

export type AnchorFreshness = "fresh" | "stale" | "future";

export function validateHouseholdConfig(value: unknown): HouseholdConfig {
  return householdConfigSchema.parse(value);
}

export function classifyAnchorFreshness(
  anchorUpdatedAt: string,
  referenceAt: string,
  staleAfterDays: number = DEFAULT_ANCHOR_STALE_AFTER_DAYS,
): AnchorFreshness {
  const anchorUpdatedAtMs = Date.parse(anchorUpdatedAt);
  const referenceAtMs = Date.parse(referenceAt);

  if (anchorUpdatedAtMs > referenceAtMs) {
    return "future";
  }

  if (referenceAtMs - anchorUpdatedAtMs > staleAfterDays * DAY_IN_MS) {
    return "stale";
  }

  return "fresh";
}
