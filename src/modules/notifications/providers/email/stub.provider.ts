import { randomUUID } from "crypto";
import { NotificationChannel } from "@prisma/client";
import type {
  DeliveryResult,
  NotificationProviderPort,
  RenderedNotification,
} from "@/modules/notifications/gateway/types";
import { logger } from "@/modules/shared/logger";

/**
 * Log-only email adapter for CI/dev — no SMTP / Resend / SendGrid.
 * Implements NotificationProviderPort for gateway injection.
 */
export class StubEmailProvider implements NotificationProviderPort {
  readonly name = "email-stub";

  async send(rendered: RenderedNotification): Promise<DeliveryResult> {
    if (rendered.channel !== NotificationChannel.EMAIL) {
      return {
        ok: false,
        correlationId: rendered.correlationId,
        errorCode: "CHANNEL_MISMATCH",
      };
    }

    const providerMessageId = `email-stub_${randomUUID()}`;

    logger.info(
      {
        provider: this.name,
        providerMessageId,
        correlationId: rendered.correlationId,
        channel: rendered.channel,
        recipientType: rendered.recipientType,
        recipientId: rendered.recipientId,
        subject: rendered.subject,
        bodyLength: rendered.body.length,
      },
      "stub email send (simulated)"
    );

    return {
      ok: true,
      correlationId: rendered.correlationId,
      providerMessageId,
    };
  }
}

export const stubEmailProvider = new StubEmailProvider();
