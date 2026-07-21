/**
 * Parse public `/jobs` search params via domain schema (no Prisma).
 */
import {
  listJobsQuerySchema,
  type ListJobsQuery,
} from "@/modules/jobs/validators/job.schema";

function flattenSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue;
    out[key] = Array.isArray(value) ? value[0] : value;
  }
  return out;
}

/** Safe parse — invalid query falls back to defaults (page 1). */
export function parsePublicJobsQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ListJobsQuery {
  const parsed = listJobsQuerySchema.safeParse(
    flattenSearchParams(searchParams),
  );
  return parsed.success ? parsed.data : {};
}
