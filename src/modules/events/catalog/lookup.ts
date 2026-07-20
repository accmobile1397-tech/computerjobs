import { EventBusError } from "@/modules/events/bus/errors";
import {
  EVENT_CATALOG_V1,
  type EventName,
} from "@/modules/events/catalog/v1";

export function getCatalogEntry(name: string, version = 1) {
  return EVENT_CATALOG_V1.find(
    (entry) => entry.name === name && entry.version === version
  );
}

export function isKnownEventName(name: string): name is EventName {
  return EVENT_CATALOG_V1.some((entry) => entry.name === name);
}

export function listCatalogEntries() {
  return EVENT_CATALOG_V1;
}

export function validateCatalogPayload(
  name: string,
  version: number,
  payload: Record<string, unknown>
): void {
  const entry = getCatalogEntry(name, version);
  if (!entry) {
    throw new EventBusError(`unknown event catalog entry: ${name} v${version}`);
  }

  for (const field of entry.payloadFields) {
    if (!(field in payload)) {
      throw new EventBusError(
        `payload missing required field "${field}" for ${name} v${version}`
      );
    }
  }
}

export function validateCatalogEvent(
  name: string,
  version: number,
  payload: Record<string, unknown>
): void {
  validateCatalogPayload(name, version, payload);
}
