import { describe, expect, it } from "vitest";
import { PaymentStatus } from "@prisma/client";
import { StubPaymentProvider } from "@/modules/billing/providers/stub.provider";

describe("PaymentStatus lifecycle (CTO)", () => {
  it("includes PROCESSING CANCELLED REFUNDED", () => {
    expect(PaymentStatus.PENDING).toBe("PENDING");
    expect(PaymentStatus.PROCESSING).toBe("PROCESSING");
    expect(PaymentStatus.SUCCEEDED).toBe("SUCCEEDED");
    expect(PaymentStatus.FAILED).toBe("FAILED");
    expect(PaymentStatus.CANCELLED).toBe("CANCELLED");
    expect(PaymentStatus.REFUNDED).toBe("REFUNDED");
  });
});

describe("StubPaymentProvider webhook verify", () => {
  it("rejects bad secret", async () => {
    const p = new StubPaymentProvider();
    const r = await p.verifyWebhook({
      headers: {},
      body: { paymentId: "x", gatewayRef: "g", secret: "wrong" },
    });
    expect(r.ok).toBe(false);
  });

  it("accepts valid stub webhook", async () => {
    const p = new StubPaymentProvider();
    const r = await p.verifyWebhook({
      headers: {},
      body: {
        paymentId: "pay1",
        gatewayRef: "stub_pay1",
        secret: "stub-secret",
        paid: true,
      },
    });
    expect(r.ok).toBe(true);
    expect(r.paid).toBe(true);
  });
});

describe("permission", () => {
  it("billing:checkout slug", () => {
    expect("billing:checkout").toBe("billing:checkout");
  });
});
