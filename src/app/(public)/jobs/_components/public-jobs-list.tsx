/**
 * Public published jobs list UI (P12-003) — Server Component only.
 * No detail links yet (P12-004). No Prisma / Client Components.
 */
import Link from "next/link";
import type { listPublicJobs } from "@/modules/jobs/services/job.service";

type PublicJobsResult = Awaited<ReturnType<typeof listPublicJobs>>;
type PublicJob = PublicJobsResult["data"][number];

const EMPLOYMENT_LABEL: Record<string, string> = {
  FULL_TIME: "تمام‌وقت",
  PART_TIME: "پاره‌وقت",
  CONTRACT: "قراردادی",
  REMOTE: "دورکاری",
  HYBRID: "ترکیبی",
};

function formatPublishedAt(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function jobsHref(page: number): string {
  return page <= 1 ? "/jobs" : `/jobs?page=${page}`;
}

export function PublicJobsList({
  jobs,
  meta,
}: {
  jobs: PublicJob[];
  meta: PublicJobsResult["meta"];
}) {
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const hasPrev = meta.page > 1;
  const hasNext = meta.page < totalPages;

  return (
    <main className="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-12">
      <header className="mb-8 space-y-2 text-right">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          فرصت‌های شغلی
        </h1>
        <p className="text-sm text-muted-foreground">
          {meta.total > 0
            ? `${meta.total.toLocaleString("fa-IR")} آگهی منتشرشده`
            : "در حال حاضر آگهی منتشرشده‌ای نیست."}
        </p>
      </header>

      {jobs.length === 0 ? (
        <p className="text-right text-muted-foreground">
          هنوز آگهی عمومی برای نمایش وجود ندارد.
        </p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li
              key={job.slug}
              className="border-b border-border pb-4 text-right last:border-b-0"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {job.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.company.name}
                {job.city?.nameFa ? ` · ${job.city.nameFa}` : ""}
                {job.category?.nameFa ? ` · ${job.category.nameFa}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {EMPLOYMENT_LABEL[job.employmentType] ?? job.employmentType}
                {job.publishedAt
                  ? ` · ${formatPublishedAt(job.publishedAt)}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          className="mt-10 flex items-center justify-between gap-4 text-sm"
          aria-label="صفحه‌بندی"
        >
          {hasPrev ? (
            <Link
              href={jobsHref(meta.page - 1)}
              className="text-foreground underline-offset-4 hover:underline"
            >
              قبلی
            </Link>
          ) : (
            <span className="text-muted-foreground">قبلی</span>
          )}
          <span className="text-muted-foreground">
            صفحه {meta.page.toLocaleString("fa-IR")} از{" "}
            {totalPages.toLocaleString("fa-IR")}
          </span>
          {hasNext ? (
            <Link
              href={jobsHref(meta.page + 1)}
              className="text-foreground underline-offset-4 hover:underline"
            >
              بعدی
            </Link>
          ) : (
            <span className="text-muted-foreground">بعدی</span>
          )}
        </nav>
      ) : null}
    </main>
  );
}
