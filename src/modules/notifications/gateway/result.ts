import type { NotificationDelivery } from "@prisma/client";
import type { DispatchResult } from "@/modules/notifications/gateway/types";

export function toDispatchResult(
  delivery: NotificationDelivery,
  extras?: { providerMessageId?: string }
): DispatchResult {
  return {
    ok: delivery.status !== "FAILED",
    notificationId: delivery.id,
    provider: delivery.provider ?? "none",
    channel: delivery.channel,
    status: delivery.status,
    skipReason: delivery.skipReason ?? undefined,
    correlationId: delivery.correlationId,
    providerMessageId: extras?.providerMessageId,
  };
}

export type IdempotencyKey = {
  eventId: string;
  channel: NotificationDelivery["channel"];
  recipientId: string;
  templateKey: string;
  templateVersion: number;
};

export function buildIdempotencyKey(
  request: {
    eventId: string;
    channel: NotificationDelivery["channel"];
    recipientId: string;
    templateKey: string;
    templateVersion?: number;
  }
): IdempotencyKey {
  return {
    eventId: request.eventId,
    channel: request.channel,
    recipientId: request.recipientId,
    templateKey: request.templateKey,
    templateVersion: request.templateVersion ?? 1,
  };
}
