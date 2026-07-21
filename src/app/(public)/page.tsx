import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  buildHomeJsonLdScriptContents,
  buildHomeMetadata,
} from "@/modules/seo/pages/home";

export const dynamic = "force-dynamic";

/** C-012-7: public pages use generateMetadata + Phase 11 builders. */
export async function generateMetadata(): Promise<Metadata> {
  return buildHomeMetadata();
}

export default function Home() {
  const jsonLdScripts = buildHomeJsonLdScriptContents();

  return (
    <>
      {jsonLdScripts.map((json, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}

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
    </>
  );
}
