import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationPreferenceCategory,
  NotificationSkipReason,
  type PrismaClient,
} from "@prisma/client";
import { NotificationGatewayError } from "@/modules/notifications/gateway/errors";
import {
  checkPreferenceAllowed,
  resolvePreferenceOwner,
} from "@/modules/notifications/gateway/preferences";
import {
  renderTemplate,
  validateTemplateVariables,
} from "@/modules/notifications/gateway/render";
import {
  buildIdempotencyKey,
  toDispatchResult,
} from "@/modules/notifications/gateway/result";
import type {
  DispatchRequest,
  DispatchResult,
  NotificationProviderPort,
} from "@/modules/notifications/gateway/types";
import { DEFAULT_NOTIFICATION_LOCALE } from "@/modules/notifications/templates/keys";
import { defaultProvidersByChannel } from "@/modules/notifications/gateway/default-providers";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";

export type NotificationGatewayDeps = {
  prisma?: PrismaClient;
  /** Explicit single provider (tests). Wins over channel map. */
  providerPort?: NotificationProviderPort;
  /** Channel → provider; defaults from gateway-owned wiring (C-009-5). */
  providersByChannel?: Partial<
    Record<NotificationChannel, NotificationProviderPort>
  >;
};

/**
 * RFC-004 pipeline (P9-007 foundation):
 * idempotency → preferences → template resolve → render → persist → optional provider port.
 */
export async function dispatchNotification(
  request: DispatchRequest,
  deps: NotificationGatewayDeps = {}
): Promise<DispatchResult> {
  const db = deps.prisma ?? defaultPrisma;
  const templateVersion = request.templateVersion ?? 1;
  const locale = request.locale ?? DEFAULT_NOTIFICATION_LOCALE;
  const correlationId = request.correlationId ?? request.eventId;
  const preferenceCategory =
    request.preferenceCategory ?? NotificationPreferenceCategory.TRANSACTIONAL;

  const idempotency = buildIdempotencyKey({
    eventId: request.eventId,
    channel: request.channel,
    recipientId: request.recipientId,
    templateKey: request.templateKey,
    templateVersion,
  });

  const existing = await db.notificationDelivery.findUnique({
    where: {
      eventId_channel_recipientId_templateKey_templateVersion: idempotency,
    },
  });
  if (existing) {
    return toDispatchResult(existing);
  }

  const baseDeliveryData = {
    eventId: request.eventId,
    eventName: request.eventName,
    correlationId,
    channel: request.channel,
    recipientType: request.recipientType,
    recipientId: request.recipientId,
    templateKey: request.templateKey,
    templateVersion,
  };

  const preferenceOwner = resolvePreferenceOwner(request);
  if (preferenceOwner) {
    const preference = await checkPreferenceAllowed(db, {
      owner: preferenceOwner,
      channel: request.channel,
      category: preferenceCategory,
    });
    if (!preference.allowed) {
      const skipped = await db.notificationDelivery.create({
        data: {
          ...baseDeliveryData,
          status: NotificationDeliveryStatus.SKIPPED,
          skipReason: preference.skipReason ?? NotificationSkipReason.OPT_OUT,
        },
      });
      return toDispatchResult(skipped);
    }
  }

  const template = await db.notificationTemplate.findFirst({
    where: {
      templateKey: request.templateKey,
      version: templateVersion,
      channel: request.channel,
      locale,
      deletedAt: null,
    },
  });

  if (!template?.isActive) {
    const skipped = await db.notificationDelivery.create({
      data: {
        ...baseDeliveryData,
        status: NotificationDeliveryStatus.SKIPPED,
        skipReason: NotificationSkipReason.TEMPLATE_DISABLED,
        templateId: template?.id,
      },
    });
    return toDispatchResult(skipped);
  }

  validateTemplateVariables(template.variablesSchema, request.variables);
  const rendered = renderTemplate(
    { subject: template.subject, body: template.body },
    request.variables
  );

  let status: NotificationDeliveryStatus = NotificationDeliveryStatus.PENDING;
  let provider: string | null = null;
  let attemptCount = 0;
  let lastErrorCode: string | null = null;
  let providerMessageId: string | undefined;

  const channelProviders = deps.providersByChannel ?? defaultProvidersByChannel();
  const providerPort =
    deps.providerPort ?? channelProviders[request.channel];

  if (providerPort) {
    attemptCount = 1;
    const sendResult = await providerPort.send({
      channel: request.channel,
      subject: rendered.subject,
      body: rendered.body,
      recipientType: request.recipientType,
      recipientId: request.recipientId,
      correlationId,
      eventId: request.eventId,
      templateKey: request.templateKey,
      templateVersion,
    });
    provider = providerPort.name;
    status = sendResult.ok
      ? NotificationDeliveryStatus.SENT
      : NotificationDeliveryStatus.FAILED;
    lastErrorCode = sendResult.errorCode ?? null;
    providerMessageId = sendResult.providerMessageId;
  }

  try {
    const delivery = await db.notificationDelivery.create({
      data: {
        ...baseDeliveryData,
        templateId: template.id,
        provider,
        status,
        attemptCount,
        lastErrorCode,
      },
    });
    return toDispatchResult(delivery, { providerMessageId });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      const raced = await db.notificationDelivery.findUnique({
        where: {
          eventId_channel_recipientId_templateKey_templateVersion: idempotency,
        },
      });
      if (raced) return toDispatchResult(raced);
    }
    throw error;
  }
}

export function assertDispatchRequest(request: DispatchRequest): void {
  if (!request.eventId.trim()) {
    throw new NotificationGatewayError("eventId is required", "INVALID_REQUEST");
  }
  if (!request.templateKey.trim()) {
    throw new NotificationGatewayError("templateKey is required", "INVALID_REQUEST");
  }
}
