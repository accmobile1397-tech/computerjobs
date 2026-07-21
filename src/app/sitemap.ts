import type { MetadataRoute } from "next";
import { buildPhase11Sitemap } from "@/modules/seo/sitemap";

/**
 * Thin App Router adapter — SEO rules live in `modules/seo/sitemap` (RFC-006).
 * Honesty (C-011-2): only live public paths (Phase 11 = `/`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildPhase11Sitemap();
}
