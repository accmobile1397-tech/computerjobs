/**
 * Domain event catalog v1 — **single source of truth** (RFC-003 §6).
 * Synced to `docs/events/EVENT_CATALOG.md`.
 */
export const EVENT_CATALOG_V1 = [
  {
    name: "job.published",
    version: 1,
    publisherModule: "jobs",
    aggregateType: "Job",
    when: "Status → PUBLISHED",
    description: "Job listing became publicly visible.",
    payloadFields: ["jobId", "companyId", "slug"],
  },
  {
    name: "job.closed",
    version: 1,
    publisherModule: "jobs",
    aggregateType: "Job",
    when: "Status → CLOSED",
    description: "Job listing closed to new applications.",
    payloadFields: ["jobId", "companyId"],
  },
  {
    name: "job.application.submitted",
    version: 1,
    publisherModule: "jobs",
    aggregateType: "JobApplication",
    when: "Application created",
    description: "Candidate submitted an application for a job.",
    payloadFields: ["jobId", "applicationId", "userId"],
    phase9NotificationMvp: true,
  },
  {
    name: "resume.created",
    version: 1,
    publisherModule: "resumes",
    aggregateType: "Resume",
    when: "First ACTIVE resume",
    description: "User activated their first resume profile.",
    payloadFields: ["resumeId", "userId"],
  },
  {
    name: "resume.updated",
    version: 1,
    publisherModule: "resumes",
    aggregateType: "Resume",
    when: "Material update",
    description: "Resume content materially changed.",
    payloadFields: ["resumeId", "userId"],
  },
  {
    name: "resume.viewed",
    version: 1,
    publisherModule: "billing",
    aggregateType: "ResumeView",
    when: "Employer view consumed",
    description: "Employer consumed a resume view entitlement.",
    payloadFields: ["resumeId", "viewerCompanyId"],
  },
  {
    name: "contact.unlocked",
    version: 1,
    publisherModule: "billing",
    aggregateType: "ContactUnlock",
    when: "ContactUnlock row created",
    description: "Employer unlocked candidate contact details.",
    payloadFields: ["companyId", "targetUserId", "unlockId"],
    phase9NotificationMvp: true,
  },
  {
    name: "payment.succeeded",
    version: 1,
    publisherModule: "billing",
    aggregateType: "Payment",
    when: "Webhook settle OK",
    description: "Payment verified and settled successfully.",
    payloadFields: ["paymentId", "ownerType", "ownerId", "sku"],
    phase9NotificationMvp: true,
  },
  {
    name: "payment.failed",
    version: 1,
    publisherModule: "billing",
    aggregateType: "Payment",
    when: "Verify/settle fail",
    description: "Payment verification or settlement failed.",
    payloadFields: ["paymentId", "reasonCode"],
  },
  {
    name: "subscription.activated",
    version: 1,
    publisherModule: "billing",
    aggregateType: "Subscription",
    when: "New/renewed ACTIVE",
    description: "Subscription became or remained active.",
    payloadFields: ["subscriptionId", "planSlug", "ownerType", "ownerId"],
    phase9NotificationMvp: true,
  },
  {
    name: "subscription.canceled",
    version: 1,
    publisherModule: "billing",
    aggregateType: "Subscription",
    when: "Cancel",
    description: "Subscription canceled by user or system.",
    payloadFields: ["subscriptionId"],
  },
  {
    name: "quota.exceeded",
    version: 1,
    publisherModule: "billing",
    aggregateType: "QuotaGate",
    when: "Gate blocked (optional)",
    description: "Feature quota limit blocked an action.",
    payloadFields: ["featureKey", "ownerType", "ownerId"],
  },
  {
    name: "ai.request.completed",
    version: 1,
    publisherModule: "ai",
    aggregateType: "AiRequest",
    when: "Gateway success",
    description: "AI gateway completed a feature request.",
    payloadFields: ["featureKey", "requestId", "creditsCaptured"],
    phase9NotificationMvp: true,
  },
  {
    name: "ai.request.failed",
    version: 1,
    publisherModule: "ai",
    aggregateType: "AiRequest",
    when: "Gateway fail",
    description: "AI gateway failed a feature request.",
    payloadFields: ["featureKey", "requestId", "errorCode"],
    phase9NotificationMvp: true,
  },
  {
    name: "company.verified",
    version: 1,
    publisherModule: "companies",
    aggregateType: "Company",
    when: "Verification → VERIFIED",
    description: "Company verification approved.",
    payloadFields: ["companyId"],
  },
  {
    name: "user.registered",
    version: 1,
    publisherModule: "auth",
    aggregateType: "User",
    when: "Register complete",
    description: "User completed registration.",
    payloadFields: ["userId", "primaryType"],
  },
] as const;

export type EventName = (typeof EVENT_CATALOG_V1)[number]["name"];

function isPhase9MvpEntry(
  entry: (typeof EVENT_CATALOG_V1)[number]
): entry is (typeof EVENT_CATALOG_V1)[number] & { phase9NotificationMvp: true } {
  return "phase9NotificationMvp" in entry && entry.phase9NotificationMvp === true;
}

/** Phase 9 notification MVP events (derived from catalog — do not duplicate elsewhere). */
export const PHASE9_MVP_EVENT_NAMES = EVENT_CATALOG_V1.filter(isPhase9MvpEntry).map(
  (entry) => entry.name
) as readonly EventName[];
