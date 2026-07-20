import { randomUUID } from "crypto";
import { NotificationChannel } from "@prisma/client";
import type {
  DeliveryResult,
  NotificationProviderPort,
  RenderedNotification,
} from "@/modules/notifications/gateway/types";
import { logger } from "@/modules/shared/logger";

/**
 * Log-only SMS adapter for CI/dev — no Kavenegar / Melipayamak / FarazSMS.
 * Implements NotificationProviderPort for gateway injection.
 * No template rendering or business logic — receives already-rendered body.
 */
export class StubSmsProvider implements NotificationProviderPort {
  readonly name = "sms-stub";

  async send(rendered: RenderedNotification): Promise<DeliveryResult> {
    if (rendered.channel !== NotificationChannel.SMS) {
      return {
        ok: false,
        correlationId: rendered.correlationId,
        errorCode: "CHANNEL_MISMATCH",
      };
    }

    const providerMessageId = `sms-stub_${randomUUID()}`;

    logger.info(
      {
        provider: this.name,
        providerMessageId,
        correlationId: rendered.correlationId,
        channel: rendered.channel,
        recipientType: rendered.recipientType,
        recipientId: rendered.recipientId,
        bodyLength: rendered.body.length,
      },
      "stub sms send (simulated)"
    );

    return {
      ok: true,
      correlationId: rendered.correlationId,
      providerMessageId,
    };
  }
}

export const stubSmsProvider = new StubSmsProvider();
