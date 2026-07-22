/**
 * Map public company DTO → Phase 11 SEO inputs (P12-006 / P12-007).
 * No Prisma — domain → SEO only. No SearchAction.
 */
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "@/modules/seo/structured-data";
import type { SeoPageInput } from "@/modules/seo/types/seo-page-input";
import type { PublicCompany } from "@/modules/companies/ui/load-public-company";

function metaDescription(
  text: string | null,
  companyName: string,
  max = 160,
): string {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  if (!flat) {
    return `پروفایل عمومی ${companyName} در ComputerJobs.ir`;
  }
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1).trimEnd()}…`;
}

export function buildPublicCompanyPageInput(
  company: PublicCompany,
): SeoPageInput {
  return {
    title: company.name,
    description: metaDescription(company.description, company.name),
    path: `/companies/${company.slug}`,
    robots: "index",
  };
}

/** BreadcrumbList JSON-LD via Phase 11 builder (P12-007 · C-012-5). */
export function buildPublicCompanyBreadcrumbScript(
  company: PublicCompany,
  options?: { baseUrl?: string },
): string | null {
  const graph = buildBreadcrumbJsonLd({
    items: [
      { name: "خانه", path: "/" },
      { name: "شرکت‌ها", path: "/companies" },
      { name: company.name, path: `/companies/${company.slug}` },
    ],
    baseUrl: options?.baseUrl,
  });
  return graph ? serializeJsonLd(graph) : null;
}
