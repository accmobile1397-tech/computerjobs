import { randomUUID } from "crypto";
import { BillingOwnerType } from "@prisma/client";
import { complete } from "@/modules/ai/gateway";
import { AI_FEATURE_KEYS, AI_PROMPT_IDS } from "@/modules/ai/constants";
import { AiError } from "@/modules/ai/types/ai.types";
import { matchJobForSeeker } from "@/modules/search/services/match.service";
import { SearchError } from "@/modules/search/services/job-search.service";

export async function explainMatch(params: {
  jobId: string;
  userId: string;
  requestId?: string;
  maxCredits?: number;
}) {
  let score;
  try {
    score = await matchJobForSeeker({
      jobId: params.jobId,
      userId: params.userId,
    });
  } catch (e) {
    if (e instanceof SearchError) throw new AiError("NOT_FOUND");
    throw e;
  }

  const requestId = params.requestId ?? randomUUID();
  const result = await complete<{ text: string }>({
    featureKey: AI_FEATURE_KEYS.MATCH_EXPLAIN,
    ownerType: BillingOwnerType.USER,
    ownerId: params.userId,
    actorUserId: params.userId,
    requestId,
    promptId: AI_PROMPT_IDS.MATCH_EXPLAIN,
    maxCredits: params.maxCredits,
    input: {
      jobId: params.jobId,
      matchScore: score,
    },
  });

  if (!result.ok) {
    throw new AiError(result.errorCode ?? "AI_UNAVAILABLE");
  }

  return {
    explanation: result.data?.text ?? "",
    matchScore: score,
    provider: result.provider,
    model: result.model,
    requestId: result.requestId,
    creditsCaptured: result.creditsCaptured,
  };
}
