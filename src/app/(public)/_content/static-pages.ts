/**
 * Static public page copy + SEO inputs (P12-002 / P12-007).
 * Content only — no Prisma / backend.
 */
import type { SeoPageInput } from "@/modules/seo/types/seo-page-input";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "@/modules/seo/structured-data";

export type StaticPageId = "about" | "contact" | "privacy" | "terms";

export type StaticPageDefinition = {
  id: StaticPageId;
  path: `/${StaticPageId}`;
  title: string;
  description: string;
  heading: string;
  paragraphs: string[];
};

export const STATIC_PAGES: Record<StaticPageId, StaticPageDefinition> = {
  about: {
    id: "about",
    path: "/about",
    title: "درباره ما",
    description:
      "آشنایی با ComputerJobs.ir — پلتفرم استخدام AI-Native برای متخصصان فناوری در ایران.",
    heading: "درباره ComputerJobs.ir",
    paragraphs: [
      "ComputerJobs.ir پلتفرم استخدام متمرکز بر جامعهٔ فناوری ایران است؛ از مهندسی نرم‌افزار و هوش مصنوعی تا DevOps و امنیت.",
      "هدف ما اتصال شفاف‌تر کارجو و کارفرما با تمرکز بر کیفیت آگهی، مهارت‌محوری و تجربهٔ کاربری فارسی و راست‌چین است.",
      "این صفحه بخشی از موجودی عمومی فاز ۱۲ است و به‌تدریج با محتوای کامل‌تر به‌روز می‌شود.",
    ],
  },
  contact: {
    id: "contact",
    path: "/contact",
    title: "تماس با ما",
    description:
      "راه‌های ارتباط با تیم ComputerJobs.ir برای پشتیبانی و همکاری.",
    heading: "تماس با ما",
    paragraphs: [
      "برای پرسش‌های عمومی، پیشنهاد همکاری یا گزارش مشکل می‌توانید از ایمیل پشتیبانی استفاده کنید.",
      "ایمیل: support@computerjobs.ir",
      "پاسخ‌گویی در روزهای کاری انجام می‌شود. فرم تماس تعاملی در نسخه‌های بعدی اضافه خواهد شد.",
    ],
  },
  privacy: {
    id: "privacy",
    path: "/privacy",
    title: "حریم خصوصی",
    description:
      "سیاست حریم خصوصی ComputerJobs.ir — نحوهٔ جمع‌آوری و استفاده از اطلاعات کاربران.",
    heading: "حریم خصوصی",
    paragraphs: [
      "ما به حریم خصوصی کاربران متعهدیم. اطلاعات حساب و رزومه صرفاً برای ارائهٔ خدمات پلتفرم و مطابق قوانین جاری استفاده می‌شود.",
      "داده‌های حساس بدون مبنای قانونی یا رضایت لازم در اختیار اشخاص ثالث قرار نمی‌گیرد.",
      "متن کامل سیاست حریم خصوصی ممکن است در به‌روزرسانی‌های بعدی تکمیل شود؛ نسخهٔ جاری مبنای حداقلی شفافیت است.",
    ],
  },
  terms: {
    id: "terms",
    path: "/terms",
    title: "قوانین و شرایط",
    description:
      "قوانین استفاده از ComputerJobs.ir برای کارجویان و کارفرمایان.",
    heading: "قوانین و شرایط استفاده",
    paragraphs: [
      "استفاده از ComputerJobs.ir به معنای پذیرش قوانین پلتفرم است. کاربران موظف‌اند اطلاعات صحیح ارائه دهند و از سوءاستفاده از خدمات خودداری کنند.",
      "آگهی‌ها و محتوای منتشرشده باید با قوانین جمهوری اسلامی ایران و سیاست‌های پلتفرم سازگار باشد.",
      "ComputerJobs.ir حق به‌روزرسانی این شرایط را دارد؛ نسخهٔ منتشرشده در این صفحه ملاک خواهد بود.",
    ],
  },
};

export function staticPageSeoInput(id: StaticPageId): SeoPageInput {
  const page = STATIC_PAGES[id];
  return {
    title: page.title,
    description: page.description,
    path: page.path,
    robots: "index",
  };
}

/** BreadcrumbList JSON-LD via Phase 11 builder (P12-007 · C-012-5). */
export function staticPageBreadcrumbScript(
  id: StaticPageId,
  options?: { baseUrl?: string },
): string | null {
  const page = STATIC_PAGES[id];
  const graph = buildBreadcrumbJsonLd({
    items: [
      { name: "خانه", path: "/" },
      { name: page.title, path: page.path },
    ],
    baseUrl: options?.baseUrl,
  });
  return graph ? serializeJsonLd(graph) : null;
}
