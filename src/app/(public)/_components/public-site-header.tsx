/**
 * Public site header (P12-003): home + live `/jobs` only.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicSiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            ComputerJobs.ir
          </Link>
          <nav aria-label="اصلی">
            <Link
              href="/jobs"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              فرصت‌های شغلی
            </Link>
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
