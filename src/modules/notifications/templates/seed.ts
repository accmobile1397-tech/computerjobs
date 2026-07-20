import type { Prisma, PrismaClient } from "@prisma/client";
import { listMvpTemplatesV1 } from "@/modules/notifications/templates/mvp.v1";

export async function seedNotificationTemplates(prisma: PrismaClient) {
  for (const template of listMvpTemplatesV1()) {
    await prisma.notificationTemplate.upsert({
      where: {
        templateKey_version_channel_locale: {
          templateKey: template.templateKey,
          version: template.version,
          channel: template.channel,
          locale: template.locale,
        },
      },
      create: {
        templateKey: template.templateKey,
        version: template.version,
        channel: template.channel,
        locale: template.locale,
        subject: template.subject,
        body: template.body,
        variablesSchema: template.variablesSchema as Prisma.InputJsonValue,
        isActive: true,
      },
      update: {
        subject: template.subject,
        body: template.body,
        variablesSchema: template.variablesSchema as Prisma.InputJsonValue,
        isActive: true,
        deletedAt: null,
      },
    });
  }
}
