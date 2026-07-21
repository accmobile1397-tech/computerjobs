import type { Metadata } from "next";
import { buildPageMetadata } from "@/modules/seo/metadata";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
  type JsonLdObject,
} from "@/modules/seo/structured-data";

const HOME_DESCRIPTION =
  "پلتفرم استخدام AI-Native برای مهندسان نرم‌افزار، هوش مصنوعی، DevOps و متخصصان فناوری در ایران.";

/**
 * Home (`/`) metadata — thin consumer of P11-003 builders.
 * No domain SEO expansion · no Phase 12 inventory.
 */
export function buildHomeMetadata(options?: { baseUrl?: string }): Metadata {
  return buildPageMetadata({
    title: "پلتفرم استخدام فناوری",
    description: HOME_DESCRIPTION,
    path: "/",
    robots: "index",
    baseUrl: options?.baseUrl,
  });
}

/**
 * Home JSON-LD graphs — Organization + WebSite (TECHNICAL_SPEC §3.5).
 * **C-011-4:** WebSite must not include SearchAction.
 */
export function buildHomeJsonLdGraphs(options?: {
  baseUrl?: string;
}): JsonLdObject[] {
  const graphs: JsonLdObject[] = [];

  const organization = buildOrganizationJsonLd({
    name: "ComputerJobs.ir",
    baseUrl: options?.baseUrl,
  });
  if (organization) graphs.push(organization);

  const website = buildWebSiteJsonLd({
    name: "ComputerJobs.ir",
    description: HOME_DESCRIPTION,
    inLanguage: "fa-IR",
    baseUrl: options?.baseUrl,
  });
  if (website) graphs.push(website);

  return graphs;
}

/** Serialized `<script type="application/ld+json">` payloads for `/`. */
export function buildHomeJsonLdScriptContents(options?: {
  baseUrl?: string;
}): string[] {
  return buildHomeJsonLdGraphs(options).map(serializeJsonLd);
}
