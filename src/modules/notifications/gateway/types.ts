import type {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationPreferenceCategory,
  NotificationRecipientType,
  NotificationSkipReason,
} from "@prisma/client";

/** RFC-004 gateway input — sole future entry point for outbound notifications. */
export type DispatchRequest = {
  templateKey: string;
  templateVersion?: number;
  channel: NotificationChannel;
  recipientType: NotificationRecipientType;
  recipientId: string;
  locale?: string;
  variables: Record<string, string | number>;
  eventId: string;
  eventName?: string;
  correlationId?: string;
  preferenceCategory?: NotificationPreferenceCategory;
  preferenceOwnerType?: "USER" | "COMPANY";
  preferenceOwnerId?: string;
};

/** RFC-004 gateway output. */
export type DispatchResult = {
  ok: boolean;
  notificationId: string;
  provider: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  skipReason?: NotificationSkipReason;
  correlationId: string;
  /** Vendor message id from provider port (not persisted until schema extension). */
  providerMessageId?: string;
};

export type RenderedNotification = {
  channel: NotificationChannel;
  subject?: string;
  body: string;
  recipientType: NotificationRecipientType;
  recipientId: string;
  correlationId: string;
  /** Set by gateway — required for InApp inbox persistence. */
  eventId?: string;
  templateKey?: string;
  templateVersion?: number;
};

/** RFC-004 provider delivery contract (stub + real adapters). */
export type DeliveryResult = {
  ok: boolean;
  correlationId: string;
  providerMessageId?: string;
  errorCode?: string;
};

/** @deprecated Prefer DeliveryResult — kept as alias for gateway/tests. */
export type ProviderSendResult = DeliveryResult;

/** Channel adapters implement this — gateway never imports vendor SDKs. */
export interface NotificationProviderPort {
  readonly name: string;
  send(rendered: RenderedNotification): Promise<DeliveryResult>;
}
