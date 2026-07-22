/**
 * Public companies sitemap source (P12-008).
 * Emits `/companies` + `/companies/{slug}` only for ACTIVE+VERIFIED companies.
 */
import { listPublicCompanySlugsForSitemap } from "@/modules/companies/services/company.service";
import { normalizePublicPath } from "@/modules/seo/urls";
import type { SitemapEntry, SitemapSource } from "@/modules/seo/sitemap/types";

export const companiesPublicSitemapSource: SitemapSource = {
  id: "companies-public",
  async listEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [
      {
        path: normalizePublicPath("/companies"),
        changeFrequency: "daily",
        priority: 0.8,
      },
    ];

    const companies = await listPublicCompanySlugsForSitemap();
    for (const company of companies) {
      entries.push({
        path: normalizePublicPath(`/companies/${company.slug}`),
        lastModified: company.lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    return entries;
  },
};
