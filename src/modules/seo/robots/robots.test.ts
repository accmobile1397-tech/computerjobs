import { describe, expect, it } from "vitest";
import {
  ROBOTS_DISALLOW_PATHS,
  buildRobotsConfig,
} from "@/modules/seo/robots";

const base = "https://computerjobs.ir";

describe("buildRobotsConfig", () => {
  it("disallows admin api auth dashboard and advertises sitemap.xml", () => {
    const config = buildRobotsConfig({ baseUrl: base });

    expect(config.rules.userAgent).toBe("*");
    expect(config.rules.allow).toBe("/");
    expect(config.rules.disallow).toEqual([...ROBOTS_DISALLOW_PATHS]);
    expect(config.rules.disallow).toContain("/admin/");
    expect(config.rules.disallow).toContain("/api/");
    expect(config.rules.disallow).toContain("/login");
    expect(config.rules.disallow).toContain("/register");
    expect(config.rules.disallow).toContain("/dashboard/");
    expect(config.sitemap).toBe("https://computerjobs.ir/sitemap.xml");
    expect(config.host).toBe("computerjobs.ir");
  });

  it("does not mention SearchAction", () => {
    const serialized = JSON.stringify(buildRobotsConfig({ baseUrl: base }));
    expect(serialized).not.toContain("SearchAction");
  });
});
