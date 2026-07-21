import { describe, expect, it } from "vitest";
import {
  buildHomeJsonLdGraphs,
  buildHomeJsonLdScriptContents,
  buildHomeMetadata,
} from "@/modules/seo/pages/home";

const base = "https://computerjobs.ir";

describe("home page SEO wiring helpers", () => {
  it("builds metadata via P11-003 with canonical /", () => {
    const meta = buildHomeMetadata({ baseUrl: base });
    expect(meta.title).toBe("پلتفرم استخدام فناوری");
    expect(meta.alternates?.canonical).toBe("https://computerjobs.ir/");
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.openGraph).toMatchObject({
      locale: "fa_IR",
      url: "https://computerjobs.ir/",
    });
  });

  it("emits Organization + WebSite without SearchAction (C-011-4)", () => {
    const graphs = buildHomeJsonLdGraphs({ baseUrl: base });
    expect(graphs.map((g) => g["@type"])).toEqual([
      "Organization",
      "WebSite",
    ]);

    const payload = buildHomeJsonLdScriptContents({ baseUrl: base }).join("\n");
    expect(payload).toContain('"@type":"Organization"');
    expect(payload).toContain('"@type":"WebSite"');
    expect(payload).not.toContain("SearchAction");
    expect(payload).not.toContain("potentialAction");
  });
});
