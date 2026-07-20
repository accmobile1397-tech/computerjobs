import { describe, expect, it } from "vitest";
import { NotificationChannel } from "@prisma/client";
import { EVENTS } from "@/modules/events/catalog";
import {
  getTemplateDefinition,
  listTemplateDefinitions,
  NOTIFICATION_TEMPLATE_KEYS,
} from "@/modules/notifications/templates/registry";

describe("notification template registry v1", () => {
  it("lists eight MVP templates across six events", () => {
    expect(listTemplateDefinitions()).toHaveLength(8);
  });

  it("resolves job.application.received for EMAIL and IN_APP", () => {
    const email = getTemplateDefinition({
      templateKey: NOTIFICATION_TEMPLATE_KEYS.JOB_APPLICATION_RECEIVED,
      channel: NotificationChannel.EMAIL,
    });
    const inApp = getTemplateDefinition({
      templateKey: NOTIFICATION_TEMPLATE_KEYS.JOB_APPLICATION_RECEIVED,
      channel: NotificationChannel.IN_APP,
    });

    expect(email.subject).toBeTruthy();
    expect(inApp.subject).toBeNull();
    expect(email.body).toContain("{{applicationId}}");
  });

  it("covers Phase 9 MVP template keys", () => {
    const keys = new Set(listTemplateDefinitions().map((t) => t.templateKey));
    expect(keys).toEqual(
      new Set([
        NOTIFICATION_TEMPLATE_KEYS.JOB_APPLICATION_RECEIVED,
        NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
        NOTIFICATION_TEMPLATE_KEYS.SUBSCRIPTION_ACTIVATED,
        NOTIFICATION_TEMPLATE_KEYS.CONTACT_UNLOCKED_CONFIRMATION,
        NOTIFICATION_TEMPLATE_KEYS.AI_REQUEST_COMPLETED,
        NOTIFICATION_TEMPLATE_KEYS.AI_REQUEST_FAILED,
      ])
    );
  });

  it("aligns channels with IMPLEMENTATION_PLAN MVP events", () => {
    const channelsByKey = listTemplateDefinitions().reduce(
      (acc, template) => {
        const list = acc.get(template.templateKey) ?? [];
        list.push(template.channel);
        acc.set(template.templateKey, list);
        return acc;
      },
      new Map<string, NotificationChannel[]>()
    );

    expect(channelsByKey.get(NOTIFICATION_TEMPLATE_KEYS.JOB_APPLICATION_RECEIVED)).toEqual(
      expect.arrayContaining([NotificationChannel.EMAIL, NotificationChannel.IN_APP])
    );
    expect(channelsByKey.get(NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT)).toEqual([
      NotificationChannel.EMAIL,
    ]);
    expect(channelsByKey.get(NOTIFICATION_TEMPLATE_KEYS.SUBSCRIPTION_ACTIVATED)).toEqual(
      expect.arrayContaining([NotificationChannel.EMAIL, NotificationChannel.IN_APP])
    );
    expect(channelsByKey.get(NOTIFICATION_TEMPLATE_KEYS.CONTACT_UNLOCKED_CONFIRMATION)).toEqual([
      NotificationChannel.IN_APP,
    ]);
    expect(channelsByKey.get(NOTIFICATION_TEMPLATE_KEYS.AI_REQUEST_COMPLETED)).toEqual([
      NotificationChannel.IN_APP,
    ]);
    expect(channelsByKey.get(NOTIFICATION_TEMPLATE_KEYS.AI_REQUEST_FAILED)).toEqual([
      NotificationChannel.IN_APP,
    ]);
  });

  it("documents registry linkage to EVENTS constants (no inline strings in features)", () => {
    expect(NOTIFICATION_TEMPLATE_KEYS.JOB_APPLICATION_RECEIVED).toBe("job.application.received");
    expect(EVENTS.JOB_APPLICATION_SUBMITTED).toBe("job.application.submitted");
  });

  it("throws when template is missing", () => {
    expect(() =>
      getTemplateDefinition({
        templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
        channel: NotificationChannel.IN_APP,
      })
    ).toThrow(/template not found/);
  });
});
