import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  VerifyWebhookInput,
  VerifyWebhookResult,
} from "@/modules/billing/providers/payment-provider";

/**
 * Deterministic sandbox provider for local/CI — no external PSP dependency.
 * Webhook body: { paymentId, gatewayRef, secret }
 */
export class StubPaymentProvider implements PaymentProvider {
  readonly name = "stub";

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const gatewayRef = `stub_${input.paymentId}`;
    const base = process.env.APP_URL ?? "http://localhost:3000";
    return {
      gatewayRef,
      redirectUrl: `${base}/api/v1/billing/return?paymentId=${input.paymentId}&gatewayRef=${gatewayRef}`,
      raw: { stub: true },
    };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<VerifyWebhookResult> {
    const body = input.body as {
      paymentId?: string;
      gatewayRef?: string;
      secret?: string;
      paid?: boolean;
    };
    const expected = process.env.BILLING_WEBHOOK_SECRET ?? "stub-secret";
    if (body.secret !== expected) {
      return { ok: false, gatewayRef: body.gatewayRef ?? "", paid: false };
    }
    if (!body.gatewayRef || !body.paymentId) {
      return { ok: false, gatewayRef: body.gatewayRef ?? "", paid: false };
    }
    return {
      ok: true,
      gatewayRef: body.gatewayRef,
      paymentId: body.paymentId,
      paid: body.paid !== false,
      raw: body,
    };
  }
}
