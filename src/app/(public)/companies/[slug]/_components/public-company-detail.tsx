/**
 * Public company detail UI (P12-006) — Server Component only.
 */
import Link from "next/link";
import type { PublicCompany } from "@/modules/companies/ui/load-public-company";

export function PublicCompanyDetail({ company }: { company: PublicCompany }) {
  return (
    <main className="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="مسیر">
        <Link
          href="/companies"
          className="hover:text-foreground hover:underline"
        >
          شرکت‌ها
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{company.name}</span>
      </nav>

      <article className="space-y-6 text-right">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {company.name}
          </h1>
          {company.industryLabel ? (
            <p className="text-sm text-muted-foreground">
              {company.industryLabel}
            </p>
          ) : null}
          {company.employeeCountRange ? (
            <p className="text-xs text-muted-foreground">
              تعداد کارکنان: {company.employeeCountRange}
            </p>
          ) : null}
        </header>

        {company.websiteUrl ? (
          <p className="text-sm">
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline-offset-4 hover:underline"
            >
              وب‌سایت شرکت
            </a>
          </p>
        ) : null}

        {company.description ? (
          <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
            {company.description}
          </div>
        ) : (
          <p className="text-muted-foreground">
            توضیحی برای این شرکت ثبت نشده است.
          </p>
        )}
      </article>
    </main>
  );
}
