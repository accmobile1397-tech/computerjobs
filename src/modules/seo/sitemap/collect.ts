import { buildCanonicalUrl } from "@/modules/seo/canonical";
import { SeoUrlError, normalizePublicPath } from "@/modules/seo/urls";
import type {
  SitemapEntry,
  SitemapSource,
} from "@/modules/seo/sitemap/types";

/** Paths that must never appear in the public sitemap. */
const BLOCKED_PREFIXES = [
  "/admin",
  "/api",
  "/login",
  "/register",
  "/dashboard",
  "/categories",
  "/locations",
  "/skills",
  "/technologies",
] as const;

export function isBlockedSitemapPath(path: string): boolean {
  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
  return BLOCKED_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/**
 * Collect + de-dupe by path. Skips blocked / invalid paths (C-011-2).
 */
export async function collectSitemapEntries(
  sources: SitemapSource[],
): Promise<SitemapEntry[]> {
  const byPath = new Map<string, SitemapEntry>();

  for (const source of sources) {
    const entries = await source.listEntries();
    for (const entry of entries) {
      let path: string;
      try {
        path = normalizePublicPath(entry.path);
      } catch (error) {
        if (error instanceof SeoUrlError) continue;
        throw error;
      }

      if (isBlockedSitemapPath(path)) continue;

      const existing = byPath.get(path);
      if (!existing) {
        byPath.set(path, { ...entry, path });
      }
    }
  }

  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/** Map internal entries → absolute Next.js sitemap rows. */
export function toNextSitemapEntries(
  entries: SitemapEntry[],
  options?: { baseUrl?: string },
): Array<{
  url: string;
  lastModified?: Date;
  changeFrequency?: SitemapEntry["changeFrequency"];
  priority?: number;
}> {
  return entries.map((entry) => ({
    url: buildCanonicalUrl({ path: entry.path, baseUrl: options?.baseUrl }),
    ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
    ...(entry.changeFrequency
      ? { changeFrequency: entry.changeFrequency }
      : {}),
    ...(entry.priority != null ? { priority: entry.priority } : {}),
  }));
}
