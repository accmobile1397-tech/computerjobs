/**
 * Public site header shell (P12-001).
 * Organizational chrome only — no job/company/static page links yet.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicSiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          ComputerJobs.ir
        </Link>
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
