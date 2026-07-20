import { describe, expect, it, vi } from "vitest";
import type { EventBus, PublishInput } from "@/modules/events/bus";
import { EVENTS } from "@/modules/events/catalog";
import { getCatalogEntry } from "@/modules/events/catalog/lookup";
import { publishJobApplicationSubmitted } from "@/modules/events/publishers/job.publisher";

describe("publishJobApplicationSubmitted", () => {
  it("publishes RFC-003 envelope via EventBus using EVENTS constant", async () => {
    const published: PublishInput[] = [];
    const bus: EventBus = {
      publish: vi.fn(async (event) => {
        published.push(event);
      }),
      registerHandler: vi.fn(),
    };

    await publishJobApplicationSubmitted(
      {
        jobId: "job-1",
        applicationId: "app-1",
        userId: "user-1",
        correlationId: "corr-1",
        actorUserId: "user-1",
      },
      bus
    );

    expect(published).toHaveLength(1);
    const event = published[0]!;
    const entry = getCatalogEntry(EVENTS.JOB_APPLICATION_SUBMITTED)!;

    expect(event.name).toBe(EVENTS.JOB_APPLICATION_SUBMITTED);
    expect(event.version).toBe(entry.version);
    expect(event.aggregateType).toBe(entry.aggregateType);
    expect(event.aggregateId).toBe("app-1");
    expect(event.correlationId).toBe("corr-1");
    expect(event.actorUserId).toBe("user-1");
    expect(event.payload).toEqual({
      jobId: "job-1",
      applicationId: "app-1",
      userId: "user-1",
    });
  });

  it("defaults correlationId and actorUserId from application context", async () => {
    const published: PublishInput[] = [];
    const bus: EventBus = {
      publish: vi.fn(async (event) => {
        published.push(event);
      }),
      registerHandler: vi.fn(),
    };

    await publishJobApplicationSubmitted(
      {
        jobId: "job-2",
        applicationId: "app-2",
        userId: "user-2",
      },
      bus
    );

    expect(published[0]?.correlationId).toBe("app-2");
    expect(published[0]?.actorUserId).toBe("user-2");
  });
});
