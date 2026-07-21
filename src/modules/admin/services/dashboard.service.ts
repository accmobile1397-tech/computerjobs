import {
  JobStatus,
  NotificationDeliveryStatus,
  PaymentStatus,
  type PrismaClient,
} from "@prisma/client";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";

export type DashboardSummary = {
  users: { total: number };
  employers: { total: number };
  jobs: { total: number; pendingReview: number };
  applications: { total: number };
  payments: { total: number; stuck: number };
  notifications: { failedDeliveries: number };
};

/**
 * Read-only dashboard aggregates (P10-004).
 * Orchestration via Prisma counts — no mutations.
 */
export async function getDashboardSummary(
  db: PrismaClient = defaultPrisma,
): Promise<DashboardSummary> {
  const softActive = { deletedAt: null };

  const [
    usersTotal,
    employersTotal,
    jobsTotal,
    jobsPendingReview,
    applicationsTotal,
    paymentsTotal,
    paymentsStuck,
    failedDeliveries,
  ] = await Promise.all([
    db.user.count({ where: softActive }),
    db.employerProfile.count({ where: softActive }),
    db.job.count({ where: softActive }),
    db.job.count({
      where: { ...softActive, status: JobStatus.PENDING_REVIEW },
    }),
    db.jobApplication.count({ where: softActive }),
    db.payment.count(),
    db.payment.count({
      where: {
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
      },
    }),
    db.notificationDelivery.count({
      where: { status: NotificationDeliveryStatus.FAILED },
    }),
  ]);

  return {
    users: { total: usersTotal },
    employers: { total: employersTotal },
    jobs: { total: jobsTotal, pendingReview: jobsPendingReview },
    applications: { total: applicationsTotal },
    payments: { total: paymentsTotal, stuck: paymentsStuck },
    notifications: { failedDeliveries },
  };
}
