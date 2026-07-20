import type {
  NotificationChannel,
  NotificationOwnerType,
  NotificationPreferenceCategory,
  PrismaClient,
} from "@prisma/client";
import { NotificationSkipReason } from "@prisma/client";
import type { DispatchRequest } from "@/modules/notifications/gateway/types";

export type PreferenceOwner = {
  ownerType: NotificationOwnerType;
  ownerId: string;
};

export function resolvePreferenceOwner(request: DispatchRequest): PreferenceOwner | null {
  if (request.preferenceOwnerType && request.preferenceOwnerId) {
    return {
      ownerType: request.preferenceOwnerType,
      ownerId: request.preferenceOwnerId,
    };
  }

  if (request.recipientType === "USER" || request.recipientType === "COMPANY") {
    return {
      ownerType: request.recipientType,
      ownerId: request.recipientId,
    };
  }

  return null;
}

export async function checkPreferenceAllowed(
  prisma: PrismaClient,
  params: {
    owner: PreferenceOwner;
    channel: NotificationChannel;
    category: NotificationPreferenceCategory;
  }
): Promise<{ allowed: boolean; skipReason?: NotificationSkipReason }> {
  const pref = await prisma.notificationPreference.findFirst({
    where: {
      ownerType: params.owner.ownerType,
      ownerId: params.owner.ownerId,
      channel: params.channel,
      category: params.category,
      deletedAt: null,
    },
  });

  if (pref) {
    return pref.enabled
      ? { allowed: true }
      : { allowed: false, skipReason: NotificationSkipReason.OPT_OUT };
  }

  if (params.category === "MARKETING") {
    return { allowed: false, skipReason: NotificationSkipReason.OPT_OUT };
  }

  return { allowed: true };
}
