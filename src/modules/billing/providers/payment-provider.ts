import type { Payment } from "@prisma/client";

export type CreatePaymentInput = {
  paymentId: string;
  amount: number;
  currency: string;
  callbackUrl: string;
  description?: string;
};

export type CreatePaymentResult = {
  gatewayRef: string;
  redirectUrl: string;
  raw?: unknown;
};

export type VerifyWebhookInput = {
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
};

export type VerifyWebhookResult = {
  ok: boolean;
  gatewayRef: string;
  paymentId?: string;
  paid: boolean;
  raw?: unknown;
};

/**
 * All PSP SDKs must live ONLY in this folder.
 * Application/services import this interface via factory — never zarinpal/idpay packages directly.
 */
export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyWebhook(input: VerifyWebhookInput): Promise<VerifyWebhookResult>;
}

export type PaymentForSettle = Pick<
  Payment,
  "id" | "status" | "gatewayRef" | "idempotencyKey" | "sku" | "ownerType" | "ownerId" | "amount" | "currency"
>;
