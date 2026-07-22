/**
 * Public company list UI (P12-005) — Server Component only.
 * No detail slug links yet (P12-006). No Prisma / Client Components.
 */
import Link from "next/link";
import type { listPublicCompanies } from "@/modules/companies/services/company.service";

type PublicCompaniesResult = Awaited<ReturnType<typeof listPublicCompanies>>;
type PublicCompany = PublicCompaniesResult["data"][number];

function companiesHref(page: number): string {
  return page <= 1 ? "/companies" : `/companies?page=${page}`;
}

function snippet(text: string | null, max = 140): string {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1).trimEnd()}…`;
}

export function PublicCompaniesList({
  companies,
  meta,
}: {
  companies: PublicCompany[];
  meta: PublicCompaniesResult["meta"];
}) {
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const hasPrev = meta.page > 1;
  const hasNext = meta.page < totalPages;

  return (
    <main className="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-12">
      <header className="mb-8 space-y-2 text-right">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          شرکت‌ها
        </h1>
        <p className="text-sm text-muted-foreground">
          {meta.total > 0
            ? `${meta.total.toLocaleString("fa-IR")} شرکت فعال`
            : "در حال حاضر شرکت عمومی برای نمایش نیست."}
        </p>
      </header>

      {companies.length === 0 ? (
        <p className="text-right text-muted-foreground">
          هنوز شرکت عمومی برای نمایش وجود ندارد.
        </p>
      ) : (
        <ul className="space-y-4">
          {companies.map((company) => (
            <li
              key={company.slug}
              className="border-b border-border pb-4 text-right last:border-b-0"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {company.name}
              </h2>
              {company.industryLabel ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {company.industryLabel}
                </p>
              ) : null}
              {company.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {snippet(company.description)}
                </p>
              ) : null}
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
              href={companiesHref(meta.page - 1)}
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
              href={companiesHref(meta.page + 1)}
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
