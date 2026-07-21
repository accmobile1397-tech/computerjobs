import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbJsonLd,
  buildJobPostingJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from "@/modules/seo/structured-data";

const base = "https://computerjobs.ir";

describe("buildOrganizationJsonLd", () => {
  it("builds Organization graph", () => {
    expect(
      buildOrganizationJsonLd({
        name: "ComputerJobs.ir",
        logoUrl: "https://computerjobs.ir/logo.png",
        sameAs: ["https://twitter.com/computerjobs"],
        baseUrl: base,
      }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ComputerJobs.ir",
      url: "https://computerjobs.ir",
      logo: "https://computerjobs.ir/logo.png",
      sameAs: ["https://twitter.com/computerjobs"],
    });
  });

  it("returns null when name is empty", () => {
    expect(buildOrganizationJsonLd({ name: "  ", baseUrl: base })).toBeNull();
  });
});

describe("buildWebSiteJsonLd", () => {
  it("builds WebSite without SearchAction (C-011-4)", () => {
    const graph = buildWebSiteJsonLd({
      name: "ComputerJobs.ir",
      description: "پلتفرم استخدام فناوری",
      baseUrl: base,
    });

    expect(graph).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ComputerJobs.ir",
      url: "https://computerjobs.ir",
      inLanguage: "fa-IR",
      description: "پلتفرم استخدام فناوری",
    });
    expect(graph).not.toHaveProperty("potentialAction");
    expect(JSON.stringify(graph)).not.toContain("SearchAction");
  });

  it("returns null when name is empty", () => {
    expect(buildWebSiteJsonLd({ name: "", baseUrl: base })).toBeNull();
  });
});

describe("buildJobPostingJsonLd", () => {
  it("builds JobPosting from public fields", () => {
    expect(
      buildJobPostingJsonLd({
        title: "Senior React",
        description: "توضیح عمومی آگهی",
        datePosted: "2026-07-01",
        hiringOrganizationName: "Acme",
        url: "https://computerjobs.ir/jobs/senior-react",
        jobLocationName: "تهران",
        employmentType: "FULL_TIME",
      }),
    ).toMatchObject({
      "@type": "JobPosting",
      title: "Senior React",
      hiringOrganization: { "@type": "Organization", name: "Acme" },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "تهران",
          addressCountry: "IR",
        },
      },
    });
  });

  it("returns null when required fields are missing", () => {
    expect(
      buildJobPostingJsonLd({
        title: "Senior React",
        description: "",
        datePosted: "2026-07-01",
        hiringOrganizationName: "Acme",
        url: "https://computerjobs.ir/jobs/senior-react",
      }),
    ).toBeNull();
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("builds BreadcrumbList with absolute item URLs", () => {
    expect(
      buildBreadcrumbJsonLd({
        items: [
          { name: "خانه", path: "/" },
          { name: "شغل‌ها", path: "/Jobs/" },
        ],
        baseUrl: base,
      }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "خانه",
          item: "https://computerjobs.ir/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "شغل‌ها",
          item: "https://computerjobs.ir/jobs",
        },
      ],
    });
  });

  it("returns null for empty items", () => {
    expect(buildBreadcrumbJsonLd({ items: [], baseUrl: base })).toBeNull();
  });
});

describe("serializeJsonLd", () => {
  it("stringifies a graph", () => {
    const graph = buildOrganizationJsonLd({
      name: "ComputerJobs.ir",
      baseUrl: base,
    });
    expect(graph).not.toBeNull();
    expect(serializeJsonLd(graph!)).toContain('"@type":"Organization"');
  });
});
