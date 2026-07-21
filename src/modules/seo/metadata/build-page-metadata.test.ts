import { describe, expect, it } from "vitest";
import {
  buildPageMetadata,
  SeoMetadataError,
} from "@/modules/seo/metadata";

const base = "https://computerjobs.ir";

describe("buildPageMetadata", () => {
  it("builds indexable metadata with canonical from P11-002 helpers", () => {
    const meta = buildPageMetadata({
      title: "فرصت‌های شغلی",
      description: "لیست فرصت‌های شغلی فناوری در ایران.",
      path: "/Jobs/",
      search: { page: "2", utm_source: "x" },
      baseUrl: base,
    });

    expect(meta.title).toBe("فرصت‌های شغلی");
    expect(meta.description).toBe("لیست فرصت‌های شغلی فناوری در ایران.");
    expect(meta.alternates?.canonical).toBe(
      "https://computerjobs.ir/jobs?page=2",
    );
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.openGraph).toMatchObject({
      locale: "fa_IR",
      siteName: "ComputerJobs.ir",
      type: "website",
      url: "https://computerjobs.ir/jobs?page=2",
      title: "فرصت‌های شغلی",
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: "فرصت‌های شغلی",
    });
  });

  it("sets noindex robots when requested", () => {
    const meta = buildPageMetadata({
      title: "ورود",
      description: "",
      path: "/login",
      robots: "noindex",
      baseUrl: base,
    });

    expect(meta.robots).toEqual({ index: false, follow: false });
    expect(meta.alternates?.canonical).toBe("https://computerjobs.ir/login");
    expect(meta.description).toBeUndefined();
  });

  it("allows OpenGraph overrides", () => {
    const meta = buildPageMetadata({
      title: "صفحه",
      description: "توضیح صفحه برای ایندکس.",
      path: "/",
      openGraph: {
        title: "OG Title",
        description: "OG Desc",
        type: "article",
        images: ["https://computerjobs.ir/og.png"],
      },
      baseUrl: base,
    });

    expect(meta.openGraph).toMatchObject({
      title: "OG Title",
      description: "OG Desc",
      type: "article",
      images: [{ url: "https://computerjobs.ir/og.png" }],
    });
    expect(meta.twitter).toMatchObject({
      title: "OG Title",
      description: "OG Desc",
    });
  });

  it("rejects empty title", () => {
    expect(() =>
      buildPageMetadata({
        title: "  ",
        description: "ok",
        path: "/",
        baseUrl: base,
      }),
    ).toThrow(SeoMetadataError);
  });

  it("rejects empty description on indexable pages", () => {
    expect(() =>
      buildPageMetadata({
        title: "خانه",
        description: "  ",
        path: "/",
        baseUrl: base,
      }),
    ).toThrow(SeoMetadataError);
  });
});
