import { resolveAppBaseUrl } from "@/modules/seo/canonical";

/** Disallow prefixes for public robots.txt (RFC-006 §7.1). */
export const ROBOTS_DISALLOW_PATHS: string[] = [
  "/admin/",
  "/api/",
  "/login",
  "/register",
  "/dashboard/",
];

export type RobotsConfig = {
  rules: {
    userAgent: string;
    allow: string;
    disallow: string[];
  };
  sitemap: string;
  host: string;
};

/**
 * Pure robots policy builder (C-011-5).
 * Sitemap line points at the live App Router `/sitemap.xml` endpoint.
 */
export function buildRobotsConfig(options?: { baseUrl?: string }): RobotsConfig {
  const base = resolveAppBaseUrl(options?.baseUrl);
  const host = new URL(base).host;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW_PATHS],
    },
    sitemap: `${base}/sitemap.xml`,
    host,
  };
}
