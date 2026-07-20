import type { Prisma } from "@prisma/client";
import { NotificationGatewayError } from "@/modules/notifications/gateway/errors";

type VariableSchema = {
  type?: string;
  required?: string[];
  properties?: Record<string, { type?: string }>;
  additionalProperties?: boolean;
};

export function validateTemplateVariables(
  schemaJson: Prisma.JsonValue | null | undefined,
  variables: Record<string, string | number>
): void {
  if (!schemaJson || typeof schemaJson !== "object" || Array.isArray(schemaJson)) {
    return;
  }

  const schema = schemaJson as VariableSchema;
  const required = schema.required ?? [];

  for (const key of required) {
    if (!(key in variables)) {
      throw new NotificationGatewayError(
        `missing template variable "${key}"`,
        "MISSING_VARIABLE"
      );
    }
  }

  if (schema.additionalProperties === false) {
    const allowed = new Set(Object.keys(schema.properties ?? {}));
    for (const key of Object.keys(variables)) {
      if (!allowed.has(key)) {
        throw new NotificationGatewayError(
          `unknown template variable "${key}"`,
          "UNKNOWN_VARIABLE"
        );
      }
    }
  }
}

export function renderTemplate(
  template: { subject: string | null; body: string },
  variables: Record<string, string | number>
): { subject?: string; body: string } {
  const interpolate = (text: string): string =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      if (!(key in variables)) {
        throw new NotificationGatewayError(
          `missing template variable "${key}"`,
          "MISSING_VARIABLE"
        );
      }
      return String(variables[key]);
    });

  return {
    subject: template.subject ? interpolate(template.subject) : undefined,
    body: interpolate(template.body),
  };
}
