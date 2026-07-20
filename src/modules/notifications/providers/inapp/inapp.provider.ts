import { randomUUID } from "crypto";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationOwnerType,
  type PrismaClient,
} from "@prisma/client";
import type {
  DeliveryResult,
  NotificationProviderPort,
  RenderedNotification,
} from "@/modules/notifications/gateway/types";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";
import { logger } from "@/modules/shared/logger";

/**
 * Persists rendered content into the Notification inbox table.
 * No template rendering · no event handling · no read/unread API.
 */
export class InAppProvider implements NotificationProviderPort {
  readonly name = "inapp";

  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  async send(rendered: RenderedNotification): Promise<DeliveryResult> {
    if (rendered.channel !== NotificationChannel.IN_APP) {
      return {
        ok: false,
        correlationId: rendered.correlationId,
        errorCode: "CHANNEL_MISMATCH",
      };
    }

    if (
      rendered.recipientType !== "USER" &&
      rendered.recipientType !== "COMPANY"
    ) {
      return {
        ok: false,
        correlationId: rendered.correlationId,
        errorCode: "INVALID_RECIPIENT",
      };
    }

    if (!rendered.eventId || !rendered.templateKey) {
      return {
        ok: false,
        correlationId: rendered.correlationId,
        errorCode: "MISSING_INBOX_METADATA",
      };
    }

    const ownerType =
      rendered.recipientType === "USER"
        ? NotificationOwnerType.USER
        : NotificationOwnerType.COMPANY;
    const templateVersion = rendered.templateVersion ?? 1;
    const providerMessageId = `inapp_${randomUUID()}`;

    try {
      const existing = await this.db.notification.findUnique({
        where: {
          eventId_ownerType_ownerId_templateKey_templateVersion: {
            eventId: rendered.eventId,
            ownerType,
            ownerId: rendered.recipientId,
            templateKey: rendered.templateKey,
            templateVersion,
          },
        },
      });

      if (existing) {
        return {
          ok: true,
          correlationId: existing.correlationId,
          providerMessageId: existing.providerMessageId ?? existing.id,
        };
      }

      const row = await this.db.notification.create({
        data: {
          ownerType,
          ownerId: rendered.recipientId,
          templateKey: rendered.templateKey,
          templateVersion,
          title: rendered.subject ?? null,
          content: rendered.body,
          eventId: rendered.eventId,
          correlationId: rendered.correlationId,
          status: NotificationDeliveryStatus.SENT,
          providerMessageId,
        },
      });

      logger.info(
        {
          provider: this.name,
          providerMessageId: row.providerMessageId,
          notificationId: row.id,
          correlationId: row.correlationId,
          ownerType: row.ownerType,
          ownerId: row.ownerId,
        },
        "inapp notification persisted"
      );

      return {
        ok: true,
        correlationId: row.correlationId,
        providerMessageId: row.providerMessageId ?? row.id,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        const raced = await this.db.notification.findUnique({
          where: {
            eventId_ownerType_ownerId_templateKey_templateVersion: {
              eventId: rendered.eventId,
              ownerType,
              ownerId: rendered.recipientId,
              templateKey: rendered.templateKey,
              templateVersion,
            },
          },
        });
        if (raced) {
          return {
            ok: true,
            correlationId: raced.correlationId,
            providerMessageId: raced.providerMessageId ?? raced.id,
          };
        }
      }

      logger.error(
        { err: error, correlationId: rendered.correlationId },
        "inapp notification persist failed"
      );
      return {
        ok: false,
        correlationId: rendered.correlationId,
        errorCode: "PERSIST_FAILED",
      };
    }
  }
}

export const inAppProvider = new InAppProvider();
