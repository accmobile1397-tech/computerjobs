import { describe, expect, it } from "vitest";
import { renderTemplate } from "@/modules/notifications/gateway/render";

describe("gateway render isolation", () => {
  it("keeps rendering independent from provider channels", () => {
    const rendered = renderTemplate(
      { subject: null, body: "SKU {{sku}}" },
      { sku: "plan-pro" }
    );
    expect(rendered.body).toBe("SKU plan-pro");
    expect(rendered.subject).toBeUndefined();
  });
});
