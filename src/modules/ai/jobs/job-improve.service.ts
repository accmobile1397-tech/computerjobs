import { randomUUID } from "crypto";
import { BillingOwnerType } from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import {
  assertCompanyAccess,
  CompanyError,
} from "@/modules/companies/services/company.service";
import { complete } from "@/modules/ai/gateway";
import { AI_FEATURE_KEYS, AI_PROMPT_IDS } from "@/modules/ai/constants";
import { AiError } from "@/modules/ai/types/ai.types";

function redact(text: string) {
  return text
    .replace(/[\w.+-]+@[\w.-]+\.\w+/g, "[email]")
    .replace(/09\d{9}/g, "[mobile]");
}

export async function improveJobDescription(params: {
  jobId: string;
  companyId: string;
  userId: string;
  draft?: string;
  requestId?: string;
  maxCredits?: number;
}) {
  try {
    await assertCompanyAccess(params.companyId, params.userId);
  } catch (e) {
    if (e instanceof CompanyError) throw new AiError("PERMISSION_DENIED");
    throw e;
  }

  const job = await prisma.job.findFirst({
    where: {
      id: params.jobId,
      companyId: params.companyId,
      deletedAt: null,
    },
    select: { id: true, title: true, description: true },
  });
  if (!job) throw new AiError("NOT_FOUND");

  const source = redact(params.draft ?? job.description);
  const requestId = params.requestId ?? randomUUID();

  const result = await complete<{ text: string }>({
    featureKey: AI_FEATURE_KEYS.JOB_IMPROVE,
    ownerType: BillingOwnerType.COMPANY,
    ownerId: params.companyId,
    actorUserId: params.userId,
    requestId,
    promptId: AI_PROMPT_IDS.JOB_IMPROVE,
    maxCredits: params.maxCredits,
    input: {
      jobId: job.id,
      title: job.title,
      description: source,
    },
  });

  if (!result.ok) {
    throw new AiError(result.errorCode ?? "AI_UNAVAILABLE");
  }

  return {
    improvedDescription: result.data?.text ?? "",
    provider: result.provider,
    model: result.model,
    requestId: result.requestId,
    creditsCaptured: result.creditsCaptured,
  };
}
