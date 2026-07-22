/**
 * Render serialized JSON-LD payloads (P12-007 wiring helper — not an SEO builder).
 */
export function JsonLdScripts({
  payloads,
}: {
  payloads: Array<string | null | undefined>;
}) {
  const scripts = payloads.filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((json, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}
    </>
  );
}
