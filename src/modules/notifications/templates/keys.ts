/** Stable notification template keys — do not use raw strings in handlers/gateway. */
export const NOTIFICATION_TEMPLATE_KEYS = {
  JOB_APPLICATION_RECEIVED: "job.application.received",
  PAYMENT_SUCCEEDED_RECEIPT: "payment.succeeded.receipt",
  SUBSCRIPTION_ACTIVATED: "subscription.activated",
  CONTACT_UNLOCKED_CONFIRMATION: "contact.unlocked.confirmation",
  AI_REQUEST_COMPLETED: "ai.request.completed",
  AI_REQUEST_FAILED: "ai.request.failed",
} as const;

export type NotificationTemplateKey =
  (typeof NOTIFICATION_TEMPLATE_KEYS)[keyof typeof NOTIFICATION_TEMPLATE_KEYS];

export const NOTIFICATION_TEMPLATE_VERSION = 1 as const;

export const DEFAULT_NOTIFICATION_LOCALE = "fa-IR" as const;
