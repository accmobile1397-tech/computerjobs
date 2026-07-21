/** Settings UI DTOs — free of Prisma (C-005-1 · C-005-2). */

export type SystemSettingItemDto = {
  key: string;
  value: unknown;
  masked: boolean;
  updatedAt: string;
  updatedById: string | null;
};

export type SettingsListDto = {
  items: SystemSettingItemDto[];
};

/** Presentation-only: feature.* are ordinary SystemSetting keys (TD-ADMIN-1 deferred). */
export function isFeatureSettingKey(key: string): boolean {
  return key.startsWith("feature.");
}

/** Format API value for the editor textarea (never invent secrets). */
export function formatSettingValueForEditor(
  item: SystemSettingItemDto,
): string {
  if (item.masked) {
    return "";
  }
  if (typeof item.value === "string") {
    return item.value;
  }
  try {
    return JSON.stringify(item.value, null, 2);
  } catch {
    return String(item.value);
  }
}

/**
 * Parse editor text into a JSON value for PUT.
 * Plain non-JSON text is sent as a string.
 */
export function parseSettingEditorValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return "";
  }
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return raw;
  }
}

export function formatSettingUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}
