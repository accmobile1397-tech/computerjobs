/**
 * Known tracking / analytics query keys stripped from canonical URLs.
 * Any `utm_*` key is also stripped.
 *
 * Non-tracking params (including `page` for C-011-6) are kept.
 * Remaining keys are sorted alphabetically when building the canonical query.
 */
const TRACKING_EXACT = new Set([
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "_ga",
  "_gl",
]);

export function isTrackingQueryParam(name: string): boolean {
  const key = name.toLowerCase();
  return key.startsWith("utm_") || TRACKING_EXACT.has(key);
}

/** Mutates `params` — deletes tracking keys. */
export function stripTrackingQueryParams(params: URLSearchParams): void {
  for (const key of [...params.keys()]) {
    if (isTrackingQueryParam(key)) {
      params.delete(key);
    }
  }
}
