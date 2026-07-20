import { EVENT_CATALOG_V1, type EventName } from "@/modules/events/catalog/v1";

function toConstantKey(name: string): string {
  return name.split(".").map((part) => part.toUpperCase()).join("_");
}

/** Typed event-name constants — values derived from catalog (NOTE-4 / NOTE-5). */
export type EventConstants = {
  readonly JOB_PUBLISHED: "job.published";
  readonly JOB_CLOSED: "job.closed";
  readonly JOB_APPLICATION_SUBMITTED: "job.application.submitted";
  readonly RESUME_CREATED: "resume.created";
  readonly RESUME_UPDATED: "resume.updated";
  readonly RESUME_VIEWED: "resume.viewed";
  readonly CONTACT_UNLOCKED: "contact.unlocked";
  readonly PAYMENT_SUCCEEDED: "payment.succeeded";
  readonly PAYMENT_FAILED: "payment.failed";
  readonly SUBSCRIPTION_ACTIVATED: "subscription.activated";
  readonly SUBSCRIPTION_CANCELED: "subscription.canceled";
  readonly QUOTA_EXCEEDED: "quota.exceeded";
  readonly AI_REQUEST_COMPLETED: "ai.request.completed";
  readonly AI_REQUEST_FAILED: "ai.request.failed";
  readonly COMPANY_VERIFIED: "company.verified";
  readonly USER_REGISTERED: "user.registered";
};

export type EventConstantKey = keyof EventConstants;

function buildEventConstants(): EventConstants {
  const built: Record<string, EventName> = {};

  for (const entry of EVENT_CATALOG_V1) {
    const key = toConstantKey(entry.name);
    if (built[key]) {
      throw new Error(`duplicate EVENTS key: ${key}`);
    }
    built[key] = entry.name;
  }

  if (Object.keys(built).length !== EVENT_CATALOG_V1.length) {
    throw new Error("EVENTS/catalog length mismatch");
  }

  return built as EventConstants;
}

/** Use EVENTS.* — never raw event name strings in publishers/handlers (NOTE-4). */
export const EVENTS: EventConstants = Object.freeze(buildEventConstants());

export function eventConstantKey(name: EventName): EventConstantKey {
  const key = toConstantKey(name);
  if (!(key in EVENTS)) {
    throw new Error(`no EVENTS constant for catalog name: ${name}`);
  }
  return key as EventConstantKey;
}
