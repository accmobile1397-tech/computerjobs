export class SeoMetadataError extends Error {
  readonly code = "SEO_METADATA_INVALID" as const;

  constructor(message: string) {
    super(message);
    this.name = "SeoMetadataError";
  }
}
