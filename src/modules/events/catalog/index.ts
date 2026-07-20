export type { EventCatalogEntry } from "@/modules/events/catalog/types";
export { CATALOG_VERSION } from "@/modules/events/catalog/types";

export {
  getCatalogEntry,
  isKnownEventName,
  listCatalogEntries,
  validateCatalogEvent,
  validateCatalogPayload,
} from "@/modules/events/catalog/lookup";

export {
  EVENT_CATALOG_V1,
  PHASE9_MVP_EVENT_NAMES,
  type EventName,
} from "@/modules/events/catalog/v1";

export {
  EVENTS,
  eventConstantKey,
  type EventConstantKey,
  type EventConstants,
} from "@/modules/events/catalog/events";
