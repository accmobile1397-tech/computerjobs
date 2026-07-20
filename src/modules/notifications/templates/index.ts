export {
  getTemplateDefinition,
  listTemplateDefinitions,
  NotificationTemplateError,
  NOTIFICATION_TEMPLATE_KEYS,
  NOTIFICATION_TEMPLATE_VERSION,
  DEFAULT_NOTIFICATION_LOCALE,
  type NotificationTemplateKey,
  type TemplateDefinition,
  type TemplateLookupParams,
  type TemplateVariableSchema,
} from "@/modules/notifications/templates/registry";

export { seedNotificationTemplates } from "@/modules/notifications/templates/seed";
