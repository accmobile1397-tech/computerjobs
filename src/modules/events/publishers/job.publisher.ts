import type { EventBus } from "@/modules/events/bus";
import { eventBus as defaultEventBus } from "@/modules/events/bus";
import { EVENTS } from "@/modules/events/catalog/events";
import { getCatalogEntry } from "@/modules/events/catalog/lookup";

export type PublishJobApplicationSubmittedInput = {
  jobId: string;
  applicationId: string;
  userId: string;
  correlationId?: string;
  actorUserId?: string;
};

/**
 * Emit `job.application.submitted` after application create (RFC-003 publish-after-commit).
 * No notification/dispatch — EventBus only.
 */
export async function publishJobApplicationSubmitted(
  input: PublishJobApplicationSubmittedInput,
  bus: EventBus = defaultEventBus
): Promise<void> {
  const entry = getCatalogEntry(EVENTS.JOB_APPLICATION_SUBMITTED);
  if (!entry) {
    throw new Error("catalog missing job.application.submitted");
  }

  await bus.publish({
    name: EVENTS.JOB_APPLICATION_SUBMITTED,
    version: entry.version,
    occurredAt: new Date().toISOString(),
    aggregateType: entry.aggregateType,
    aggregateId: input.applicationId,
    correlationId: input.correlationId ?? input.applicationId,
    actorUserId: input.actorUserId ?? input.userId,
    payload: {
      jobId: input.jobId,
      applicationId: input.applicationId,
      userId: input.userId,
    },
  });
}
