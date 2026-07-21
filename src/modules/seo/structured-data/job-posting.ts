import type {
  JsonLdObject,
  JobPostingJsonLdInput,
} from "@/modules/seo/structured-data/types";

/**
 * JobPosting JSON-LD from **public** fields only.
 * Returns `null` when required fields are missing (RFC-006 §8.2).
 */
export function buildJobPostingJsonLd(
  input: JobPostingJsonLdInput,
): JsonLdObject | null {
  const title = input.title.trim();
  const description = input.description.trim();
  const datePosted = input.datePosted.trim();
  const hiringOrganizationName = input.hiringOrganizationName.trim();
  const url = input.url.trim();

  if (
    !title ||
    !description ||
    !datePosted ||
    !hiringOrganizationName ||
    !url
  ) {
    return null;
  }

  const jobLocationName = input.jobLocationName?.trim();
  const employmentType = input.employmentType?.trim();
  const validThrough = input.validThrough?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    datePosted,
    url,
    hiringOrganization: {
      "@type": "Organization",
      name: hiringOrganizationName,
    },
    ...(jobLocationName
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: jobLocationName,
              addressCountry: "IR",
            },
          },
        }
      : {}),
    ...(employmentType ? { employmentType } : {}),
    ...(validThrough ? { validThrough } : {}),
  };
}
