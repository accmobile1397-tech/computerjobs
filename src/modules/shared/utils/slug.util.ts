const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "auth",
  "companies",
  "profiles",
  "jobs",
  "login",
  "register",
  "health",
  "me",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export function normalizeSlugInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 220);
}

export function slugFromName(name: string, suffix?: string): string {
  const base = normalizeSlugInput(name) || "user";
  return suffix ? `${base}-${suffix}`.slice(0, 220) : base;
}

export function validateSlugFormat(slug: string): boolean {
  if (slug.length < 2 || slug.length > 220) return false;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  return !isReservedSlug(slug);
}

export function validateWebsiteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
