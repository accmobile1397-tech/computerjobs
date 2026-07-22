/**
 * Map public company DTO → Phase 11 SEO inputs (P12-006).
 * No Prisma — domain → SEO only. No Breadcrumb / SearchAction.
 */
import type { SeoPageInput } from "@/modules/seo/types/seo-page-input";
import type { PublicCompany } from "@/modules/companies/ui/load-public-company";

function metaDescription(text: string | null, companyName: string, max = 160): string {
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
