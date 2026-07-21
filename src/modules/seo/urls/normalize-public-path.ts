export class SeoUrlError extends Error {
  readonly code = "SEO_URL_INVALID" as const;

  constructor(message: string) {
    super(message);
    this.name = "SeoUrlError";
  }
}

/** UUID v1–v5 shape — forbidden on public SEO paths (RFC-006). */
const UUID_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Normalize a public path for SEO helpers (RFC-006 §9).
 * Path only — query/hash are discarded if present.
 */
export function normalizePublicPath(input: string): string {
  if (typeof input !== "string" || input.trim() === "") {
    throw new SeoUrlError("path is required");
  }

  let raw = input.trim();

  if (/^[a-zA-Z][a-zA-Z+\-.]*:/.test(raw)) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      throw new SeoUrlError("invalid URL");
    }
  } else {
    const q = raw.indexOf("?");
    const h = raw.indexOf("#");
    let end = raw.length;
    if (q !== -1) end = Math.min(end, q);
    if (h !== -1) end = Math.min(end, h);
    raw = raw.slice(0, end);
  }

  let path = raw.startsWith("/") ? raw : `/${raw}`;
  path = path.replace(/\/{2,}/g, "/").toLowerCase();

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  for (const segment of path.split("/")) {
    if (!segment) continue;
    let decoded = segment;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      // keep raw segment
    }
    if (UUID_SEGMENT.test(decoded)) {
      throw new SeoUrlError(
        "UUID path segments are not allowed on public SEO URLs",
      );
    }
  }

  return path === "" ? "/" : path;
}
