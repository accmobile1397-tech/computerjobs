/**
 * Map public job DTO → Phase 11 SEO inputs (P12-004).
 * No Prisma — domain → SEO only.
 */
import { buildCanonicalUrl } from "@/modules/seo/canonical";
import {
  buildJobPostingJsonLd,
  serializeJsonLd,
} from "@/modules/seo/structured-data";
import type { SeoPageInput } from "@/modules/seo/types/seo-page-input";
import type { PublicJob } from "@/modules/jobs/ui/load-public-job";

function toIsoDate(value: Date | string | null | undefined): string {
  if (value == null) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function metaDescription(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (!flat) return "آگهی شغلی در ComputerJobs.ir";
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1).trimEnd()}…`;
}

export function buildPublicJobPageInput(job: PublicJob): SeoPageInput {
  return {
    title: job.title,
    description: metaDescription(job.description),
    path: `/jobs/${job.slug}`,
    robots: "index",
  };
}

/**
 * JobPosting JSON-LD script for a public PUBLISHED job (C-012-9).
 * Returns null when required fields are insufficient (omit script).
 */
export function buildPublicJobPostingScript(
  job: PublicJob,
  options?: { baseUrl?: string },
): string | null {
  const url = buildCanonicalUrl({
    path: `/jobs/${job.slug}`,
    baseUrl: options?.baseUrl,
  });

  const graph = buildJobPostingJsonLd({
    title: job.title,
    description: job.description,
    datePosted: toIsoDate(job.publishedAt),
    hiringOrganizationName: job.company.name,
    url,
    jobLocationName: job.city?.nameFa,
    employmentType: job.employmentType,
    validThrough: toIsoDate(job.expiresAt) || undefined,
  });

  return graph ? serializeJsonLd(graph) : null;
}
