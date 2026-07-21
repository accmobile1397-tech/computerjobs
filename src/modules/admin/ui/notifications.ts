/**
 * Notification admin UI helpers — Phase 9 Admin APIs only (C-005-1 · C-009-6).
 * No Prisma imports. Inbox remains GET-only (no mark-read / delete).
 */

export type NotificationChannelDto =
  | "EMAIL"
  | "SMS"
  | "IN_APP"
  | "PUSH"
  | "WEBHOOK";

export type NotificationDeliveryStatusDto =
  | "PENDING"
  | "SENT"
  | "DELIVERED"
  | "FAILED"
  | "SKIPPED";

export type NotificationOwnerTypeDto = "USER" | "COMPANY";

export const NOTIFICATION_CHANNEL_OPTIONS: readonly NotificationChannelDto[] = [
  "EMAIL",
  "SMS",
  "IN_APP",
  "PUSH",
  "WEBHOOK",
] as const;

export const NOTIFICATION_DELIVERY_STATUS_OPTIONS: readonly NotificationDeliveryStatusDto[] =
  ["PENDING", "SENT", "DELIVERED", "FAILED", "SKIPPED"] as const;

export type NotificationListMeta = {
  items: unknown[];
  page: number;
  limit: number;
  total: number;
};

export type NotificationTemplateDto = {
  id: string;
  templateKey: string;
  version: number;
  channel: NotificationChannelDto;
  locale: string;
  subject: string | null;
  body: string;
  variablesSchema: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationTemplateListDto = {
  items: NotificationTemplateDto[];
  page: number;
  limit: number;
  total: number;
};

export type UpsertTemplateInput = {
  templateKey: string;
  version: number;
  channel: NotificationChannelDto;
  locale: string;
  subject: string | null;
  body: string;
  variablesSchema?: unknown;
  isActive: boolean;
};

export type PatchTemplateInput = {
  subject?: string | null;
  body?: string;
  variablesSchema?: unknown;
  isActive?: boolean;
  locale?: string;
};

export type NotificationMappingDto = {
  id: string;
  configVersion: number;
  eventName: string;
  templateKey: string;
  channel: NotificationChannelDto;
  recipientRule: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationMappingListDto = {
  items: NotificationMappingDto[];
  page: number;
  limit: number;
  total: number;
};

export type UpsertMappingInput = {
  configVersion: number;
  eventName: string;
  templateKey: string;
  channel: NotificationChannelDto;
  recipientRule: string;
  sortOrder: number;
  isActive: boolean;
};

export type PatchMappingInput = {
  recipientRule?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type NotificationDeliveryDto = {
  id: string;
  eventId: string;
  eventName: string | null;
  correlationId: string;
  channel: NotificationChannelDto;
  recipientType: string;
  recipientId: string;
  templateKey: string;
  templateVersion: number;
  provider: string | null;
  status: NotificationDeliveryStatusDto;
  skipReason: string | null;
  attemptCount: number;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  createdAt: string;
};

export type NotificationDeliveryListDto = {
  items: NotificationDeliveryDto[];
  page: number;
  limit: number;
  total: number;
};

export type DeliveryListFilters = {
  page: number;
  limit: number;
  eventId: string;
  eventName: string;
  templateKey: string;
  channel: string;
  status: string;
  correlationId: string;
};

export const DEFAULT_DELIVERY_FILTERS: DeliveryListFilters = {
  page: 1,
  limit: 20,
  eventId: "",
  eventName: "",
  templateKey: "",
  channel: "",
  status: "",
  correlationId: "",
};

export type NotificationInboxItemDto = {
  id: string;
  ownerType: NotificationOwnerTypeDto;
  ownerId: string;
  templateKey: string;
  title: string | null;
  content: string;
  eventId: string;
  correlationId: string;
  status: NotificationDeliveryStatusDto;
  readAt: string | null;
  createdAt: string;
};

export type NotificationInboxListDto = {
  items: NotificationInboxItemDto[];
  page: number;
  limit: number;
  total: number;
};

export type InboxListFilters = {
  page: number;
  limit: number;
  ownerId: string;
  correlationId: string;
  eventId: string;
};

export const DEFAULT_INBOX_FILTERS: InboxListFilters = {
  page: 1,
  limit: 20,
  ownerId: "",
  correlationId: "",
  eventId: "",
};

export type NotificationHubLink = {
  href: string;
  label: string;
  description: string;
  readOnly?: boolean;
};

/** Sub-pages for the notifications hub (presentation only). */
export const NOTIFICATION_HUB_LINKS: readonly NotificationHubLink[] = [
  {
    href: "/admin/notifications/templates",
    label: "قالب‌ها",
    description: "ایجاد و ویرایش قالب‌های اعلان",
  },
  {
    href: "/admin/notifications/mappings",
    label: "نگاشت رویداد",
    description: "اتصال رویداد دامنه به قالب و کانال",
  },
  {
    href: "/admin/notifications/deliveries",
    label: "تحویل‌ها",
    description: "مشاهده وضعیت ارسال (فقط خواندنی)",
    readOnly: true,
  },
  {
    href: "/admin/notifications/inbox",
    label: "صندوق ورودی",
    description: "مشاهده inbox پشتیبانی — بدون mark-read/حذف (C-009-6)",
    readOnly: true,
  },
] as const;

export function buildTemplatesQueryString(page: number, limit: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  return params.toString();
}

export function buildMappingsQueryString(input: {
  page: number;
  limit: number;
  configVersion?: string;
}): string {
  const params = new URLSearchParams();
  params.set("page", String(input.page));
  params.set("limit", String(input.limit));
  if (input.configVersion?.trim()) {
    params.set("configVersion", input.configVersion.trim());
  }
  return params.toString();
}

export function buildDeliveriesQueryString(filters: DeliveryListFilters): string {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.eventId.trim()) params.set("eventId", filters.eventId.trim());
  if (filters.eventName.trim()) params.set("eventName", filters.eventName.trim());
  if (filters.templateKey.trim()) {
    params.set("templateKey", filters.templateKey.trim());
  }
  if (filters.channel.trim()) params.set("channel", filters.channel.trim());
  if (filters.status.trim()) params.set("status", filters.status.trim());
  if (filters.correlationId.trim()) {
    params.set("correlationId", filters.correlationId.trim());
  }
  return params.toString();
}

export function buildInboxQueryString(filters: InboxListFilters): string {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.ownerId.trim()) params.set("ownerId", filters.ownerId.trim());
  if (filters.correlationId.trim()) {
    params.set("correlationId", filters.correlationId.trim());
  }
  if (filters.eventId.trim()) params.set("eventId", filters.eventId.trim());
  return params.toString();
}

export function formatNotificationDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export function formatReadAt(readAt: string | null): string {
  if (!readAt) return "خوانده‌نشده";
  return formatNotificationDateTime(readAt);
}
