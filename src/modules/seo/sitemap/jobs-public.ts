/**
 * Public jobs sitemap source (P12-008).
 * Emits `/jobs` + `/jobs/{slug}` only for jobs that pass getPublicJobBySlug gates.
 */
import { listPublicJobSlugsForSitemap } from "@/modules/jobs/services/job.service";
import { normalizePublicPath } from "@/modules/seo/urls";
import type { SitemapEntry, SitemapSource } from "@/modules/seo/sitemap/types";

export const jobsPublicSitemapSource: SitemapSource = {
  id: "jobs-public",
  async listEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [
      {
        path: normalizePublicPath("/jobs"),
        changeFrequency: "daily",
        priority: 0.8,
      },
    ];

    const jobs = await listPublicJobSlugsForSitemap();
    for (const job of jobs) {
      entries.push({
        path: normalizePublicPath(`/jobs/${job.slug}`),
        lastModified: job.lastModified,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }

    return entries;
  },
};
