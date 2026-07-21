import type { Prisma, PrismaClient } from "@prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";
import type { UpsertSettingInput } from "@/modules/admin/validators/platform-api.schema";

const SENSITIVE_KEY_RE = /(secret|token|key)/i;
export const MASKED_VALUE = "***";

export function isSensitiveSettingKey(key: string): boolean {
  return SENSITIVE_KEY_RE.test(key);
}

export type SystemSettingItem = {
  key: string;
  value: Prisma.JsonValue | typeof MASKED_VALUE;
  masked: boolean;
  updatedAt: Date;
  updatedById: string | null;
};

function toPublicItem(row: {
  key: string;
  valueJson: Prisma.JsonValue;
  updatedAt: Date;
  updatedById: string | null;
}): SystemSettingItem {
  const masked = isSensitiveSettingKey(row.key);
  return {
    key: row.key,
    value: masked ? MASKED_VALUE : row.valueJson,
    masked,
    updatedAt: row.updatedAt,
    updatedById: row.updatedById,
  };
}

/**
 * SystemSetting admin list — masks *secret* / *token* / *key* keys (P10-006).
 * No Feature Flag Engine (C-005-2).
 */
export async function listSystemSettings(
  db: PrismaClient = defaultPrisma,
): Promise<SystemSettingItem[]> {
  const rows = await db.systemSetting.findMany({
    orderBy: { key: "asc" },
  });
  return rows.map(toPublicItem);
}

export type UpsertSettingParams = UpsertSettingInput & {
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Upsert SystemSetting + audit (SYSTEM_SETTING_UPDATED).
 */
export async function upsertSystemSetting(
  params: UpsertSettingParams,
  db: PrismaClient = defaultPrisma,
): Promise<SystemSettingItem> {
  const row = await db.systemSetting.upsert({
    where: { key: params.key },
    create: {
      key: params.key,
      valueJson: params.value as Prisma.InputJsonValue,
      updatedById: params.actorUserId,
    },
    update: {
      valueJson: params.value as Prisma.InputJsonValue,
      updatedById: params.actorUserId,
    },
  });

  await writeAuditLog({
    userId: params.actorUserId,
    action: "SYSTEM_SETTING_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { key: params.key },
  });

  return toPublicItem(row);
}
