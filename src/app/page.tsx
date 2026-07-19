import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-lg font-bold">ComputerJobs.ir</span>
          <nav className="flex gap-2">
            <Button variant="ghost" size="sm">
              ورود
            </Button>
            <Button size="sm">ثبت‌نام</Button>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="mb-4 text-sm text-muted-foreground">به‌زودی</p>
        <h1 className="mb-6 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          پلتفرم استخدام AI-Native برای متخصصان فناوری ایران
        </h1>
        <p className="mb-8 max-w-xl text-lg text-muted-foreground">
          مهندسان نرم‌افزار، هوش مصنوعی، DevOps، امنیت سایبری و سایر
          متخصصان فناوری — فرصت‌های شغلی متناسب با مهارت شما.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg">جستجوی فرصت‌های شغلی</Button>
          <Button variant="outline" size="lg">
            ثبت آگهی استخدام
          </Button>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ComputerJobs.ir — Phase 0 Foundation
      </footer>
    </div>
  );
}
