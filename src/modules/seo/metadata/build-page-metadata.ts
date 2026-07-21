import type { Metadata } from "next";
import { buildCanonicalUrl } from "@/modules/seo/canonical";
import { SeoMetadataError } from "@/modules/seo/metadata/errors";
import type { SeoPageInput } from "@/modules/seo/types/seo-page-input";

const SITE_NAME = "ComputerJobs.ir";
const OG_LOCALE = "fa_IR";

type OpenGraphType = NonNullable<
  Extract<NonNullable<Metadata["openGraph"]>, { type?: unknown }>["type"]
>;

export type { SeoPageInput };

/**
 * Pure metadata builder for Next.js `Metadata` (RFC-006 §4).
 * Reuses P11-002 canonical utilities — no domain SEO logic.
 */
export function buildPageMetadata(input: SeoPageInput): Metadata {
  const title = input.title.trim();
  if (!title) {
    throw new SeoMetadataError("title is required");
  }

  const robotsMode = input.robots ?? "index";
  const description = input.description.trim();

  if (robotsMode === "index" && !description) {
    throw new SeoMetadataError(
      "description is required for indexable pages",
    );
  }

  const canonical = buildCanonicalUrl({
    path: input.path,
    search: input.search,
    baseUrl: input.baseUrl,
  });

  const ogTitle = input.openGraph?.title?.trim() || title;
  const ogDescription =
    input.openGraph?.description?.trim() || description || undefined;
  const ogType = (input.openGraph?.type?.trim() || "website") as OpenGraphType;
  const ogImages = input.openGraph?.images?.filter(Boolean).map((url) => ({
    url,
  }));

  const metadata: Metadata = {
    title,
    ...(description ? { description } : {}),
    alternates: {
      canonical,
    },
    robots:
      robotsMode === "noindex"
        ? { index: false, follow: false }
        : { index: true, follow: true },
    openGraph: {
      type: ogType,
      locale: OG_LOCALE,
      siteName: SITE_NAME,
      url: canonical,
      title: ogTitle,
      ...(ogDescription ? { description: ogDescription } : {}),
      ...(ogImages && ogImages.length > 0 ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      ...(ogDescription ? { description: ogDescription } : {}),
    },
  };

  return metadata;
}
