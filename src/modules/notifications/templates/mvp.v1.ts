import type { NotificationChannel } from "@prisma/client";
import {
  DEFAULT_NOTIFICATION_LOCALE,
  NOTIFICATION_TEMPLATE_KEYS,
  NOTIFICATION_TEMPLATE_VERSION,
  type NotificationTemplateKey,
} from "@/modules/notifications/templates/keys";

export type TemplateVariableSchema = {
  type: "object";
  required: string[];
  properties: Record<string, { type: "string" | "number" }>;
  additionalProperties: false;
};

export type TemplateDefinition = {
  templateKey: NotificationTemplateKey;
  version: number;
  channel: NotificationChannel;
  locale: string;
  subject: string | null;
  body: string;
  variablesSchema: TemplateVariableSchema;
};

function schema(
  required: string[],
  properties: Record<string, "string" | "number">
): TemplateVariableSchema {
  return {
    type: "object",
    required,
    properties: Object.fromEntries(
      Object.entries(properties).map(([key, type]) => [key, { type }])
    ),
    additionalProperties: false,
  };
}

/** Phase 9 MVP template registry v1 — source for DB seed (RFC-004). */
export const MVP_TEMPLATES_V1: readonly TemplateDefinition[] = [
  {
    templateKey: NOTIFICATION_TEMPLATE_KEYS.JOB_APPLICATION_RECEIVED,
    version: NOTIFICATION_TEMPLATE_VERSION,
    channel: "EMAIL",
    locale: DEFAULT_NOTIFICATION_LOCALE,
    subject: "درخواست جدید برای آگهی {{jobId}}",
    body: "یک درخواست جدید ({{applicationId}}) برای آگهی {{jobId}} از کاربر {{userId}} ثبت شد.",
    variablesSchema: schema(["jobId", "applicationId", "userId"], {
      jobId: "string",
      applicationId: "string",
      userId: "string",
    }),
  },
  {
    templateKey: NOTIFICATION_TEMPLATE_KEYS.JOB_APPLICATION_RECEIVED,
    version: NOTIFICATION_TEMPLATE_VERSION,
    channel: "IN_APP",
    locale: DEFAULT_NOTIFICATION_LOCALE,
    subject: null,
    body: "درخواست جدید برای آگهی شما ثبت شد ({{applicationId}}).",
    variablesSchema: schema(["jobId", "applicationId", "userId"], {
      jobId: "string",
      applicationId: "string",
      userId: "string",
    }),
  },
  {
    templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
    version: NOTIFICATION_TEMPLATE_VERSION,
    channel: "EMAIL",
    locale: DEFAULT_NOTIFICATION_LOCALE,
    subject: "رسید پرداخت",
    body: "پرداخت {{paymentId}} با موفقیت انجام شد. SKU: {{sku}}",
    variablesSchema: schema(["paymentId", "ownerType", "ownerId", "sku"], {
      paymentId: "string",
      ownerType: "string",
      ownerId: "string",
      sku: "string",
    }),
  },
  {
    templateKey: NOTIFICATION_TEMPLATE_KEYS.SUBSCRIPTION_ACTIVATED,
    version: NOTIFICATION_TEMPLATE_VERSION,
    channel: "EMAIL",
    locale: DEFAULT_NOTIFICATION_LOCALE,
    subject: "اشتراک فعال شد",
    body: "اشتراک {{subscriptionId}} با پلن {{planSlug}} فعال شد.",
    variablesSchema: schema(
      ["subscriptionId", "planSlug", "ownerType", "ownerId"],
      {
        subscriptionId: "string",
        planSlug: "string",
        ownerType: "string",
        ownerId: "string",
      }
    ),
  },
  {
    templateKey: NOTIFICATION_TEMPLATE_KEYS.SUBSCRIPTION_ACTIVATED,
    version: NOTIFICATION_TEMPLATE_VERSION,
    channel: "IN_APP",
    locale: DEFAULT_NOTIFICATION_LOCALE,
    subject: null,
    body: "اشتراک {{planSlug}} فعال شد.",
    variablesSchema: schema(
      ["subscriptionId", "planSlug", "ownerType", "ownerId"],
      {
        subscriptionId: "string",
        planSlug: "string",
        ownerType: "string",
        ownerId: "string",
      }
    ),
  },
  {
    templateKey: NOTIFICATION_TEMPLATE_KEYS.CONTACT_UNLOCKED_CONFIRMATION,
    version: NOTIFICATION_TEMPLATE_VERSION,
    channel: "IN_APP",
    locale: DEFAULT_NOTIFICATION_LOCALE,
    subject: null,
    body: "اطلاعات تماس باز شد ({{unlockId}}).",
    variablesSchema: schema(["companyId", "targetUserId", "unlockId"], {
      companyId: "string",
      targetUserId: "string",
      unlockId: "string",
    }),
  },
  {
    templateKey: NOTIFICATION_TEMPLATE_KEYS.AI_REQUEST_COMPLETED,
    version: NOTIFICATION_TEMPLATE_VERSION,
    channel: "IN_APP",
    locale: DEFAULT_NOTIFICATION_LOCALE,
    subject: null,
    body: "درخواست AI ({{featureKey}}) با موفقیت انجام شد.",
    variablesSchema: schema(["featureKey", "requestId", "creditsCaptured"], {
      featureKey: "string",
      requestId: "string",
      creditsCaptured: "number",
    }),
  },
  {
    templateKey: NOTIFICATION_TEMPLATE_KEYS.AI_REQUEST_FAILED,
    version: NOTIFICATION_TEMPLATE_VERSION,
    channel: "IN_APP",
    locale: DEFAULT_NOTIFICATION_LOCALE,
    subject: null,
    body: "درخواست AI ({{featureKey}}) ناموفق بود: {{errorCode}}",
    variablesSchema: schema(["featureKey", "requestId", "errorCode"], {
      featureKey: "string",
      requestId: "string",
      errorCode: "string",
    }),
  },
] as const;

export function listMvpTemplatesV1(): readonly TemplateDefinition[] {
  return MVP_TEMPLATES_V1;
}
