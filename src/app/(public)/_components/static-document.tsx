/**
 * Shared static document layout (P12-002) — RTL Persian prose shell.
 */
export function StaticDocument({
  heading,
  paragraphs,
}: {
  heading: string;
  paragraphs: string[];
}) {
  return (
    <main className="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-12">
      <article className="space-y-6 text-right">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {heading}
        </h1>
        {paragraphs.map((text) => (
          <p
            key={text.slice(0, 24)}
            className="text-base leading-8 text-muted-foreground"
          >
            {text}
          </p>
        ))}
      </article>
    </main>
  );
}
