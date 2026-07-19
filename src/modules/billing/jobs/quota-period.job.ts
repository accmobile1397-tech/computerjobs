/**
 * Scheduled quota period ownership (Phase 7A).
 * Job name: billing.ensurePeriodBoundaries
 * Owner module: billing
 * Runner: BullMQ (shared/queue)
 * Cadence: SystemSetting billing.quota_job_cron (seed: 0 * * * *)
 *
 * Strategy: QuotaUsage rows are keyed by periodKey — no wipe on rollover.
 */
import { ensurePeriodBoundaries } from "@/modules/billing/services/quota.service";

export const BILLING_QUOTA_JOB = "billing.ensurePeriodBoundaries";

export async function runQuotaPeriodJob() {
  return ensurePeriodBoundaries();
}
