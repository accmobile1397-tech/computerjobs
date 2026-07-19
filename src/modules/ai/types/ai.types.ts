import type { BillingOwnerType } from "@prisma/client";

export type AiErrorCode =
  | "AI_UNAVAILABLE"
  | "QUOTA_EXCEEDED"
  | "AI_CREDIT_REQUIRED"
  | "AI_RATE_LIMITED"
  | "MODERATION_BLOCKED"
  | "VALIDATION_ERROR"
  | "PERMISSION_DENIED"
  | "NOT_FOUND";

export class AiError extends Error {
  constructor(public code: AiErrorCode) {
    super(code);
  }
}

export type AiRequest = {
  featureKey: string;
  ownerType: BillingOwnerType;
  ownerId: string;
  actorUserId?: string;
  requestId: string;
  /** Redacted user/job payload fields */
  input: Record<string, unknown>;
  promptId: string;
  maxCredits?: number;
};

export type AiResponseMeta = {
  provider: string;
  model: string;
  requestId: string;
  creditsCaptured: number;
};

export type AiResponse<T = unknown> = AiResponseMeta & {
  ok: boolean;
  estimatedCredits?: number;
  data?: T;
  errorCode?: AiErrorCode;
};

export type ProviderCompleteInput = {
  model: string;
  systemPrompt: string;
  userContent: string;
  timeoutMs: number;
};

export type ProviderCompleteResult = {
  text: string;
  provider: string;
  model: string;
};

export type AiProvider = {
  name: string;
  complete(input: ProviderCompleteInput): Promise<ProviderCompleteResult>;
  moderate?(text: string): Promise<{ allowed: boolean; reason?: string }>;
};
