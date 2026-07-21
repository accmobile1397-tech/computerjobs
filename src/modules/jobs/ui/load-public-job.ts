/**
 * Load a public published job for SSR pages (P12-004).
 * Returns null when not found / not public (C-012-8) — caller uses notFound().
 */
import { cache } from "react";
import {
  getPublicJobBySlug,
  JobError,
} from "@/modules/jobs/services/job.service";

export type PublicJob = Awaited<ReturnType<typeof getPublicJobBySlug>>;

export const loadPublicJobBySlug = cache(
  async (slug: string): Promise<PublicJob | null> => {
    try {
      return await getPublicJobBySlug(slug);
    } catch (error) {
      if (error instanceof JobError && error.code === "JOB_NOT_FOUND") {
        return null;
      }
      throw error;
    }
  },
);
