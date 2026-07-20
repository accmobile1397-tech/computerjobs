import type { NotificationChannel } from "@prisma/client";
import {
  DEFAULT_NOTIFICATION_LOCALE,
  type NotificationTemplateKey,
} from "@/modules/notifications/templates/keys";
import {
  listMvpTemplatesV1,
  type TemplateDefinition,
} from "@/modules/notifications/templates/mvp.v1";

export type TemplateLookupParams = {
  templateKey: NotificationTemplateKey | string;
  version?: number;
  channel: NotificationChannel;
  locale?: string;
};

export class NotificationTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationTemplateError";
  }
}

/** Load template definition from registry — never inline bodies in services. */
export function getTemplateDefinition(params: TemplateLookupParams): TemplateDefinition {
  const version = params.version ?? 1;
  const locale = params.locale ?? DEFAULT_NOTIFICATION_LOCALE;

  const found = listMvpTemplatesV1().find(
    (entry) =>
      entry.templateKey === params.templateKey &&
      entry.version === version &&
      entry.channel === params.channel &&
      entry.locale === locale
  );

  if (!found) {
    throw new NotificationTemplateError(
      `template not found: ${params.templateKey} v${version} ${params.channel} ${locale}`
    );
  }

  return found;
}

export function listTemplateDefinitions(): readonly TemplateDefinition[] {
  return listMvpTemplatesV1();
}

export {
  DEFAULT_NOTIFICATION_LOCALE,
  NOTIFICATION_TEMPLATE_KEYS,
  NOTIFICATION_TEMPLATE_VERSION,
  type NotificationTemplateKey,
} from "@/modules/notifications/templates/keys";

export type { TemplateDefinition, TemplateVariableSchema } from "@/modules/notifications/templates/mvp.v1";
export { listMvpTemplatesV1 } from "@/modules/notifications/templates/mvp.v1";
