/** RFC-003 catalog entry metadata (no delivery/notification logic). */
export type EventCatalogEntry = {
  name: string;
  version: number;
  publisherModule: string;
  aggregateType: string;
  when: string;
  description: string;
  /** Required payload keys (PII-redacted ids/slugs only). */
  payloadFields: readonly string[];
  /** Phase 9 notification MVP — see IMPLEMENTATION_PLAN.md */
  phase9NotificationMvp?: boolean;
};

export const CATALOG_VERSION = 1 as const;
