import { EventBusError } from "@/modules/events/bus/errors";
import type { DomainEvent, PublishInput } from "@/modules/events/bus/types";
import {
  getCatalogEntry,
  validateCatalogEvent,
} from "@/modules/events/catalog/lookup";

const EVENT_NAME_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new EventBusError(`${field} must be a non-empty string`);
  }
  return value;
}

function parseIsoTimestamp(value: unknown): string {
  const raw = requireNonEmptyString(value, "occurredAt");
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) {
    throw new EventBusError("occurredAt must be a valid ISO-8601 timestamp");
  }
  return new Date(ms).toISOString();
}

function parseVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new EventBusError("version must be an integer >= 1");
  }
  return value;
}

function parsePayload(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new EventBusError("payload must be a plain object");
  }
  return value as Record<string, unknown>;
}

function parseOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return requireNonEmptyString(value, field);
}

/** Structural + catalog validation (RFC-003 envelope + v1 metadata). */
export function validateEnvelope(input: PublishInput): DomainEvent {
  const name = requireNonEmptyString(input.name, "name");
  if (!EVENT_NAME_PATTERN.test(name)) {
    throw new EventBusError(
      `name must be lowercase dot.case (e.g. job.application.submitted); got "${name}"`
    );
  }

  const eventIdRaw = input.eventId;
  if (eventIdRaw !== undefined && !UUID_PATTERN.test(eventIdRaw)) {
    throw new EventBusError("eventId must be a UUID when provided");
  }

  const version = parseVersion(input.version);
  const payload = parsePayload(input.payload);
  validateCatalogEvent(name, version, payload);

  const entry = getCatalogEntry(name, version);
  if (!entry) {
    throw new EventBusError(`unknown event catalog entry: ${name} v${version}`);
  }

  const aggregateType = requireNonEmptyString(input.aggregateType, "aggregateType");
  if (aggregateType !== entry.aggregateType) {
    throw new EventBusError(
      `aggregateType must be "${entry.aggregateType}" for ${name} v${version}`
    );
  }

  return {
    eventId: eventIdRaw ?? "",
    name,
    version,
    occurredAt: parseIsoTimestamp(input.occurredAt),
    actorUserId: parseOptionalString(input.actorUserId, "actorUserId"),
    aggregateType: entry.aggregateType,
    aggregateId: requireNonEmptyString(input.aggregateId, "aggregateId"),
    correlationId: parseOptionalString(input.correlationId, "correlationId"),
    payload,
  };
}
