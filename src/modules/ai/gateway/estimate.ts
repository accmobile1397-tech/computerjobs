import { getSetting } from "@/modules/billing/services/billing-core";
import { SETTING_KEYS } from "@/modules/billing/constants";
import type { AiRequest } from "@/modules/ai/types/ai.types";

const DEFAULT_COSTS: Record<string, number> = {
  "ai.match.explain": 1,
  "ai.job.improve_description": 2,
};

/** Pure estimate — used by gateway and unit tests. */
export function computeEstimatedCredits(
  featureKey: string,
  input: Record<string, unknown>,
  costs: Record<string, number> = DEFAULT_COSTS,
): number {
  const base = costs[featureKey] ?? 1;
  const payload = JSON.stringify(input);
  const approxTokens = Math.ceil(payload.length / 4);
  const surcharge = approxTokens > 4000 ? Math.ceil((approxTokens - 4000) / 2000) : 0;
  return base + surcharge;
}

/** Heuristic cost: base feature cost + size surcharge for oversized payloads. */
export async function estimateCost(request: AiRequest): Promise<number> {
  const costs = await getSetting<Record<string, number>>(
    SETTING_KEYS.AI_FEATURE_COSTS,
    DEFAULT_COSTS,
  );
  return computeEstimatedCredits(request.featureKey, request.input, costs);
}
