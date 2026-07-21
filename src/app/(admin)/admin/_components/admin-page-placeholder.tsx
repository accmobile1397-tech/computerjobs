/** Placeholder until P10-009 — shell only (P10-008). */
export function AdminPagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground">
        این صفحه فقط اسکلت ناوبری است — داده از Admin API در تسک‌های بعدی بارگذاری
        می‌شود.
      </p>
    </div>
  );
}
