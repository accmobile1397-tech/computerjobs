import {
  SeoUrlError,
  normalizePublicPath,
} from "@/modules/seo/urls/normalize-public-path";
import { stripTrackingQueryParams } from "@/modules/seo/urls/tracking-params";


export { SeoUrlError, normalizePublicPath } from "@/modules/seo/urls/normalize-public-path";
export {
  isTrackingQueryParam,
  stripTrackingQueryParams,
} from "@/modules/seo/urls/tracking-params";

export type CanonicalSearchInput =
  | string
  | URLSearchParams
  | Record<string, string | string[] | undefined | null>;

function toSearchParams(input: CanonicalSearchInput | undefined): URLSearchParams {
  if (input == null || input === "") {
    return new URLSearchParams();
  }
  if (typeof input === "string") {
    const q = input.startsWith("?") ? input.slice(1) : input;
    return new URLSearchParams(q);
  }
  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input);
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null && item !== "") params.append(key, item);
      }
    } else if (value !== "") {
      params.set(key, value);
    }
  }
  return params;
}

/**
 * Stable query string: strip tracking, keep `page` (C-011-6), sort keys A–Z.
 */
export function buildCanonicalQuery(search?: CanonicalSearchInput): string {
  const params = toSearchParams(search);
  stripTrackingQueryParams(params);

  const sorted = new URLSearchParams();
  const keys = [...new Set(params.keys())].sort((a, b) => a.localeCompare(b));
  for (const key of keys) {
    for (const value of params.getAll(key)) {
      sorted.append(key, value);
    }
  }
  return sorted.toString();
}

export function resolveAppBaseUrl(baseUrl?: string): string {
  const raw = (baseUrl ?? process.env.APP_URL ?? "http://localhost:3000").trim();
  if (!raw) {
    throw new SeoUrlError("APP_URL is required for canonical URLs");
  }
  return raw.replace(/\/+$/, "");
}

/**
 * Absolute canonical URL: `APP_URL + normalizePublicPath(path) + cleaned query`.
 *
 * **C-011-6:** pagination (`page`) is self-canonical — kept on the URL;
 * `rel` prev/next is deferred to Phase 12.
 */
export function buildCanonicalUrl(options: {
  path: string;
  search?: CanonicalSearchInput;
  baseUrl?: string;
}): string {
  const base = resolveAppBaseUrl(options.baseUrl);
  const path = normalizePublicPath(options.path);
  const query = buildCanonicalQuery(options.search);
  return query ? `${base}${path}?${query}` : `${base}${path}`;
}
