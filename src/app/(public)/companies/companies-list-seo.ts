/**
 * P12-005 — public `/companies` list SEO inputs (Phase 11 builders).
 */
import type { SeoPageInput } from "@/modules/seo/types/seo-page-input";

export const COMPANIES_LIST_TITLE = "شرکت‌ها";
export const COMPANIES_LIST_DESCRIPTION =
  "فهرست شرکت‌های فعال و قابل‌نمایش در ComputerJobs.ir.";

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Build SeoPageInput for `/companies`.
 * Passes `page` into search when present (C-011-6 self-canonical).
 */
export function companiesListSeoInput(
  searchParams?: Record<string, string | string[] | undefined>,
): SeoPageInput {
  const page = firstParam(searchParams?.page);
  return {
    title: COMPANIES_LIST_TITLE,
    description: COMPANIES_LIST_DESCRIPTION,
    path: "/companies",
    robots: "index",
    ...(page ? { search: { page } } : {}),
  };
}
