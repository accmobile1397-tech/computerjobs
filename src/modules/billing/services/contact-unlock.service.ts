import {
  BillingOwnerType,
  CompanyStatus,
  CompanyVerificationStatus,
  ConsumableType,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import {
  assertCompanyAccess,
  CompanyError,
} from "@/modules/companies/services/company.service";
import { FEATURE_KEYS } from "@/modules/billing/constants";
import { BillingError } from "@/modules/billing/services/billing-core";
import { consumeQuota } from "@/modules/billing/services/quota.service";

export async function hasContactUnlock(companyId: string, targetUserId: string) {
  const row = await prisma.contactUnlock.findUnique({
    where: {
      companyId_targetUserId: { companyId, targetUserId },
    },
  });
  return Boolean(row);
}

export async function unlockContact(params: {
  companyId: string;
  targetUserId: string;
  actorUserId: string;
}) {
  try {
    await assertCompanyAccess(params.companyId, params.actorUserId);
  } catch (e) {
    if (e instanceof CompanyError) throw new BillingError(e.code);
    throw e;
  }

  const company = await prisma.company.findFirst({
    where: {
      id: params.companyId,
      deletedAt: null,
      status: CompanyStatus.ACTIVE,
      verificationStatus: CompanyVerificationStatus.VERIFIED,
    },
  });
  if (!company) throw new BillingError("COMPANY_NOT_VERIFIED");

  const existing = await prisma.contactUnlock.findUnique({
    where: {
      companyId_targetUserId: {
        companyId: params.companyId,
        targetUserId: params.targetUserId,
      },
    },
  });
  if (existing) return existing;

  const consumed = await consumeQuota({
    ownerType: BillingOwnerType.COMPANY,
    ownerId: params.companyId,
    featureKey: FEATURE_KEYS.CONTACT_UNLOCK_PER_MONTH,
    defaultPlanSlug: "employer_free",
    actorUserId: params.actorUserId,
    refType: "contact_unlock",
    refId: params.targetUserId,
  });

  const unlock = await prisma.contactUnlock.create({
    data: {
      companyId: params.companyId,
      targetUserId: params.targetUserId,
      unlockedByUserId: params.actorUserId,
    },
  });

  await writeAuditLog({
    userId: params.actorUserId,
    action: "CONTACT_UNLOCKED",
    metadata: {
      companyId: params.companyId,
      targetUserId: params.targetUserId,
      unlockId: unlock.id,
      source: consumed.source,
      consumableType: ConsumableType.CONTACT_UNLOCK,
    },
  });

  return unlock;
}
