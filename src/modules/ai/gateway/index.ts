import { BillingOwnerType, ConsumableType } from "@prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { SETTING_KEYS } from "@/modules/billing/constants";
import { getSetting } from "@/modules/billing/services/billing-core";
import {
  captureWallet,
  getWalletAvailable,
  releaseWallet,
  reserveWallet,
} from "@/modules/billing/services/wallet.service";
import { BillingError } from "@/modules/billing/services/billing-core";
import { estimateCost } from "@/modules/ai/gateway/estimate";
import { moderate } from "@/modules/ai/gateway/moderate";
import { checkRateLimit } from "@/modules/ai/gateway/rate-limit";
import { resolveModel } from "@/modules/ai/gateway/routing";
import { loadPrompt } from "@/modules/ai/prompts/registry";
import { resolveProviderChain } from "@/modules/ai/providers";
import type { AiRequest, AiResponse } from "@/modules/ai/types/ai.types";
import { AiError } from "@/modules/ai/types/ai.types";

const idempotency = new Map<string, AiResponse>();

function buildUserContent(input: Record<string, unknown>): string {
  return JSON.stringify(input, null, 2);
}

async function assertRateLimits(request: AiRequest) {
  const userLimit = await getSetting(SETTING_KEYS.AI_RATE_USER, 20);
  const companyLimit = await getSetting(SETTING_KEYS.AI_RATE_COMPANY, 40);
  const globalLimit = await getSetting(SETTING_KEYS.AI_RATE_GLOBAL, 200);

  const ownerOk =
    request.ownerType === BillingOwnerType.COMPANY
      ? checkRateLimit({
          key: `company:${request.ownerId}`,
          limit: companyLimit,
        })
      : checkRateLimit({
          key: `user:${request.ownerId}`,
          limit: userLimit,
        });
  const globalOk = checkRateLimit({ key: "global", limit: globalLimit });
  if (!ownerOk || !globalOk) throw new AiError("AI_RATE_LIMITED");
}

/**
 * Sole entry for billable completions.
 * Pipeline: resolveModel → loadPrompt → estimateCost → moderate → RESERVE → provider → CAPTURE|RELEASE
 */
export async function complete<T = { text: string }>(
  request: AiRequest,
): Promise<AiResponse<T>> {
  const cached = idempotency.get(request.requestId);
  if (cached) return cached as AiResponse<T>;

  try {
    await assertRateLimits(request);

    const model = await resolveModel(request.featureKey);
    const { body: systemPrompt, promptId } = loadPrompt(request.promptId);
    const estimatedCredits = await estimateCost(request);

    const available = await getWalletAvailable(
      request.ownerType,
      request.ownerId,
      ConsumableType.AI_CREDIT,
    );
    const allowedCredits = request.maxCredits ?? available;

    if (estimatedCredits > allowedCredits) {
      throw new AiError("AI_CREDIT_REQUIRED");
    }

    const providers = await resolveProviderChain();
    const primary = providers[0];
    const userContent = buildUserContent(request.input);
    await moderate(`${systemPrompt}\n${userContent}`, primary);

    await reserveWallet({
      ownerType: request.ownerType,
      ownerId: request.ownerId,
      consumableType: ConsumableType.AI_CREDIT,
      amount: estimatedCredits,
      actorUserId: request.actorUserId,
      refType: "ai_request",
      refId: request.requestId.slice(0, 36),
      requestId: request.requestId,
    });

    const timeoutMs = await getSetting(SETTING_KEYS.AI_TIMEOUT_MS, 30_000);
    let lastError: unknown;
    let result: { text: string; provider: string; model: string } | null = null;

    for (const provider of providers) {
      try {
        result = await provider.complete({
          model,
          systemPrompt,
          userContent,
          timeoutMs,
        });
        break;
      } catch (e) {
        lastError = e;
      }
    }

    if (!result) {
      await releaseWallet({
        ownerType: request.ownerType,
        ownerId: request.ownerId,
        consumableType: ConsumableType.AI_CREDIT,
        amount: estimatedCredits,
        actorUserId: request.actorUserId,
        requestId: request.requestId,
      });
      await writeAuditLog({
        userId: request.actorUserId,
        action: "AI_REQUEST_FAILED",
        metadata: {
          featureKey: request.featureKey,
          requestId: request.requestId,
          promptId,
          error: lastError instanceof Error ? lastError.message : "unavailable",
        },
      });
      throw new AiError("AI_UNAVAILABLE");
    }

    await captureWallet({
      ownerType: request.ownerType,
      ownerId: request.ownerId,
      consumableType: ConsumableType.AI_CREDIT,
      amount: estimatedCredits,
      actorUserId: request.actorUserId,
      requestId: request.requestId,
    });

    const response: AiResponse<T> = {
      ok: true,
      provider: result.provider,
      model: result.model,
      requestId: request.requestId,
      creditsCaptured: estimatedCredits,
      estimatedCredits,
      data: { text: result.text } as T,
    };

    await writeAuditLog({
      userId: request.actorUserId,
      action: "AI_REQUEST_COMPLETED",
      metadata: {
        featureKey: request.featureKey,
        requestId: request.requestId,
        promptId,
        provider: result.provider,
        model: result.model,
        creditsCaptured: estimatedCredits,
      },
    });

    idempotency.set(request.requestId, response);
    return response;
  } catch (error) {
    if (error instanceof BillingError) {
      if (error.code === "QUOTA_EXCEEDED") {
        return {
          ok: false,
          provider: "none",
          model: "none",
          requestId: request.requestId,
          creditsCaptured: 0,
          errorCode: "QUOTA_EXCEEDED",
        };
      }
      throw new AiError("VALIDATION_ERROR");
    }
    if (error instanceof AiError) {
      const fail: AiResponse<T> = {
        ok: false,
        provider: "none",
        model: "none",
        requestId: request.requestId,
        creditsCaptured: 0,
        errorCode: error.code,
      };
      if (
        error.code === "AI_CREDIT_REQUIRED" ||
        error.code === "MODERATION_BLOCKED" ||
        error.code === "AI_RATE_LIMITED" ||
        error.code === "QUOTA_EXCEEDED" ||
        error.code === "VALIDATION_ERROR"
      ) {
        return fail;
      }
      throw error;
    }
    throw error;
  }
}

/** Required gateway surface — embeddings reserved for later features. */
export async function embed(_request: AiRequest): Promise<AiResponse> {
  throw new AiError("AI_UNAVAILABLE");
}

export { moderate } from "@/modules/ai/gateway/moderate";
