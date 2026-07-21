/**
 * Public site header (P12-001).
 * C-012-10: public nav only — no admin, dashboard, or profile links.
 */
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/modules/shared/utils/cn";

const PRIMARY_NAV = [
  { href: "/jobs", label: "فرصت‌های شغلی" },
  { href: "/companies", label: "شرکت‌ها" },
] as const;

export function PublicSiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            ComputerJobs.ir
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="اصلی">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav className="flex gap-2" aria-label="حساب">
          <Button variant="ghost" size="sm" type="button">
            ورود
          </Button>
          <Button size="sm" type="button">
            ثبت‌نام
          </Button>
        </nav>
      </div>
    </header>
  );
}
