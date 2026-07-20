import {
  CompanyMemberRole,
  NotificationRecipientType,
  type PrismaClient,
} from "@prisma/client";
import type { DomainEvent } from "@/modules/events/bus/types";
import type { RecipientRule } from "@/modules/notifications/handlers/mapping.v1";

export type ResolvedRecipient = {
  recipientType: NotificationRecipientType;
  recipientId: string;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function billingOwnerRecipient(
  payload: Record<string, unknown>
): ResolvedRecipient[] {
  const ownerId = asString(payload.ownerId);
  const ownerType = asString(payload.ownerType);
  if (!ownerId || !ownerType) return [];

  if (ownerType === "USER") {
    return [{ recipientType: NotificationRecipientType.USER, recipientId: ownerId }];
  }
  if (ownerType === "COMPANY") {
    return [
      { recipientType: NotificationRecipientType.COMPANY, recipientId: ownerId },
    ];
  }
  return [];
}

/**
 * Resolves recipient rules from event envelope + DB lookups (no provider imports).
 */
export async function resolveRecipients(
  event: DomainEvent,
  rules: RecipientRule[],
  prisma: PrismaClient
): Promise<ResolvedRecipient[]> {
  const results: ResolvedRecipient[] = [];
  const seen = new Set<string>();

  const push = (recipient: ResolvedRecipient) => {
    const key = `${recipient.recipientType}:${recipient.recipientId}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(recipient);
  };

  for (const rule of rules) {
    switch (rule) {
      case "payment.owner":
      case "subscription.owner": {
        for (const r of billingOwnerRecipient(event.payload)) push(r);
        break;
      }
      case "contact.target_user": {
        const targetUserId = asString(event.payload.targetUserId);
        if (targetUserId) {
          push({
            recipientType: NotificationRecipientType.USER,
            recipientId: targetUserId,
          });
        }
        break;
      }
      case "ai.request.owner": {
        if (event.actorUserId) {
          push({
            recipientType: NotificationRecipientType.USER,
            recipientId: event.actorUserId,
          });
        }
        break;
      }
      case "job.company.owner":
      case "job.company.members": {
        const jobId = asString(event.payload.jobId);
        if (!jobId) break;

        const job = await prisma.job.findFirst({
          where: { id: jobId, deletedAt: null },
          select: { companyId: true },
        });
        if (!job) break;

        const members = await prisma.companyMember.findMany({
          where: {
            companyId: job.companyId,
            deletedAt: null,
            ...(rule === "job.company.owner"
              ? { role: CompanyMemberRole.OWNER }
              : {}),
          },
          select: { userId: true },
        });

        for (const member of members) {
          push({
            recipientType: NotificationRecipientType.USER,
            recipientId: member.userId,
          });
        }
        break;
      }
      default:
        break;
    }
  }

  return results;
}
