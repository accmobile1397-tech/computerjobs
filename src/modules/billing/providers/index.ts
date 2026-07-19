import type { PaymentProvider } from "@/modules/billing/providers/payment-provider";
import { StubPaymentProvider } from "@/modules/billing/providers/stub.provider";
import { getSetting } from "@/modules/billing/services/billing-core";

const SETTING_KEY = "activePaymentProvider";

/**
 * Resolves active PSP from SystemSetting — never import concrete PSP outside providers/.
 */
export async function getActivePaymentProvider(): Promise<PaymentProvider> {
  const name = await getSetting<string>(SETTING_KEY, "stub");
  switch (name) {
    case "stub":
      return new StubPaymentProvider();
    // Future: case "zarinpal": return new ZarinpalPaymentProvider();
    default:
      return new StubPaymentProvider();
  }
}

export { SETTING_KEY as ACTIVE_PAYMENT_PROVIDER_SETTING };
