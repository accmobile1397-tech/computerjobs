import { PaymentStatus, type PrismaClient } from "@prisma/client";
import {
  checkDatabaseConnection,
  prisma as defaultPrisma,
} from "@/modules/shared/prisma/client";
import { checkRedisConnection } from "@/modules/shared/redis/client";

export type MonitoringSummary = {
  status: "ok" | "degraded";
  checks: {
    database: "ok" | "error";
    redis: "ok" | "error";
  };
  counters: {
    /** Domain events in the last 24h (lightweight). */
    domainEventsLast24h: number;
    /** Payments stuck in PENDING/PROCESSING. */
    paymentsStuck: number;
  };
};

export type MonitoringDeps = {
  db?: PrismaClient;
  checkDatabase?: () => Promise<boolean>;
  checkRedis?: () => Promise<boolean>;
};

/**
 * Read-only monitoring summary (P10-006) — no mutations.
 */
export async function getMonitoringSummary(
  deps: MonitoringDeps = {},
): Promise<MonitoringSummary> {
  const db = deps.db ?? defaultPrisma;
  const checkDatabase = deps.checkDatabase ?? checkDatabaseConnection;
  const checkRedis = deps.checkRedis ?? checkRedisConnection;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [databaseOk, redisOk, domainEventsLast24h, paymentsStuck] =
    await Promise.all([
      checkDatabase(),
      checkRedis(),
      db.domainEventLog.count({
        where: { createdAt: { gte: since } },
      }),
      db.payment.count({
        where: {
          status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
        },
      }),
    ]);

  const allHealthy = databaseOk && redisOk;

  return {
    status: allHealthy ? "ok" : "degraded",
    checks: {
      database: databaseOk ? "ok" : "error",
      redis: redisOk ? "ok" : "error",
    },
    counters: {
      domainEventsLast24h,
      paymentsStuck,
    },
  };
}
