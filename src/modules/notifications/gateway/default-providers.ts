import { NotificationChannel } from "@prisma/client";
import type { NotificationProviderPort } from "@/modules/notifications/gateway/types";
import { stubEmailProvider } from "@/modules/notifications/providers/email/stub.provider";
import { inAppProvider } from "@/modules/notifications/providers/inapp/inapp.provider";
import { stubSmsProvider } from "@/modules/notifications/providers/sms/stub.provider";

/**
 * Channel → provider wiring lives in the gateway layer only (C-009-5).
 * Handlers must never import these providers.
 */
export function defaultProvidersByChannel(): Partial<
  Record<NotificationChannel, NotificationProviderPort>
> {
  return {
    [NotificationChannel.EMAIL]: stubEmailProvider,
    [NotificationChannel.SMS]: stubSmsProvider,
    [NotificationChannel.IN_APP]: inAppProvider,
  };
}
