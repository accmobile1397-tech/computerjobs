export type {
  DeliveryResult,
  DispatchRequest,
  DispatchResult,
  NotificationProviderPort,
  ProviderSendResult,
  RenderedNotification,
} from "@/modules/notifications/gateway/types";

export { NotificationGatewayError } from "@/modules/notifications/gateway/errors";
export {
  assertDispatchRequest,
  dispatchNotification,
  type NotificationGatewayDeps,
} from "@/modules/notifications/gateway/dispatch";
export { checkPreferenceAllowed, resolvePreferenceOwner } from "@/modules/notifications/gateway/preferences";
export { renderTemplate, validateTemplateVariables } from "@/modules/notifications/gateway/render";
export { buildIdempotencyKey, toDispatchResult } from "@/modules/notifications/gateway/result";
