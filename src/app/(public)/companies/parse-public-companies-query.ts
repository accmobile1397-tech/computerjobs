/**
 * Parse public `/companies` search params via domain schema (no Prisma).
 */
import {
  listCompaniesQuerySchema,
  type ListCompaniesQuery,
} from "@/modules/companies/validators/company.schema";

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
export function parsePublicCompaniesQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ListCompaniesQuery {
  const parsed = listCompaniesQuerySchema.safeParse(
    flattenSearchParams(searchParams),
  );
  return parsed.success ? parsed.data : {};
}
