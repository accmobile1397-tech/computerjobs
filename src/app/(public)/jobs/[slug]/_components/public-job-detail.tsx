/**
 * Public job detail UI (P12-004) — Server Component only.
 */
import Link from "next/link";
import type { PublicJob } from "@/modules/jobs/ui/load-public-job";

const EMPLOYMENT_LABEL: Record<string, string> = {
  FULL_TIME: "تمام‌وقت",
  PART_TIME: "پاره‌وقت",
  CONTRACT: "قراردادی",
  REMOTE: "دورکاری",
  HYBRID: "ترکیبی",
};

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function PublicJobDetail({ job }: { job: PublicJob }) {
  return (
    <main className="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="مسیر">
        <Link href="/jobs" className="hover:text-foreground hover:underline">
          فرصت‌های شغلی
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{job.title}</span>
      </nav>

      <article className="space-y-6 text-right">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {job.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {job.company.name}
            {job.city?.nameFa ? ` · ${job.city.nameFa}` : ""}
            {job.category?.nameFa ? ` · ${job.category.nameFa}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {EMPLOYMENT_LABEL[job.employmentType] ?? job.employmentType}
            {job.publishedAt ? ` · ${formatDate(job.publishedAt)}` : ""}
          </p>
        </header>

        {job.skills.length > 0 ? (
          <ul className="flex flex-wrap justify-end gap-2" aria-label="مهارت‌ها">
            {job.skills.map((skill) => (
              <li
                key={skill.slug}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
              >
                {skill.nameFa}
              </li>
            ))}
          </ul>
        ) : null}

        {job.salary ? (
          <p className="text-sm text-muted-foreground">
            حقوق:
            {job.salary.min != null
              ? ` از ${job.salary.min.toLocaleString("fa-IR")}`
              : ""}
            {job.salary.max != null
              ? ` تا ${job.salary.max.toLocaleString("fa-IR")}`
              : ""}
            {job.salary.currency ? ` ${job.salary.currency}` : ""}
          </p>
        ) : null}

        <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
          {job.description}
        </div>
      </article>
    </main>
  );
}
