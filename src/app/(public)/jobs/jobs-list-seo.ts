/**
 * P12-003 — public `/jobs` list SEO inputs (Phase 11 builders).
 */
import type { SeoPageInput } from "@/modules/seo/types/seo-page-input";

export const JOBS_LIST_TITLE = "فرصت‌های شغلی";
export const JOBS_LIST_DESCRIPTION =
  "فهرست آگهی‌های شغلی منتشرشده در حوزه فناوری در ComputerJobs.ir.";

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Build SeoPageInput for `/jobs`.
 * Passes `page` into search when present (C-011-6 self-canonical).
 */
export function jobsListSeoInput(
  searchParams?: Record<string, string | string[] | undefined>,
): SeoPageInput {
  const page = firstParam(searchParams?.page);
  return {
    title: JOBS_LIST_TITLE,
    description: JOBS_LIST_DESCRIPTION,
    path: "/jobs",
    robots: "index",
    ...(page ? { search: { page } } : {}),
  };
}
