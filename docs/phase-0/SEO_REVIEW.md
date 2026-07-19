# SEO Review — Phase 0

**پروژه:** ComputerJobs.ir  
**فاز:** 0  
**وضعیت:** Baseline

---

## پیاده‌سازی شده

| مورد | وضعیت | جزئیات |
|------|--------|--------|
| SSR | ✅ | `force-dynamic` در صفحه اصلی |
| Root Metadata | ✅ | title, description, openGraph, twitter, robots |
| RTL + lang=fa | ✅ | `src/app/layout.tsx` |
| robots.txt | ✅ | `public/robots.txt` |
| Font | ✅ | Vazirmatn via next/font |
| Mobile First | ✅ | Tailwind responsive layout |

---

## پیاده‌سازی نشده (فازهای بعد)

| مورد | فاز هدف |
|------|---------|
| Canonical URLs per page | Phase 12 |
| Structured Data (JobPosting, Organization, Breadcrumb) | Phase 12 |
| sitemap.xml | Phase 12 |
| Programmatic SEO URLs | Phase 12 |
| Core Web Vitals audit | Phase 12 |
| Image optimization strategy | Phase 4+ |

---

## یافته‌ها

### MED-001: metadataBase به APP_URL وابسته است

در production باید `APP_URL=https://computerjobs.ir` در OpenShip تنظیم شود.

### LOW-001: sitemap.xml هنوز وجود ندارد

`robots.txt` به sitemap اشاره می‌کند — Phase 12 باید sitemap واقعی اضافه کند.

### LOW-001: Structured Data JSON-LD

صفحه اصلی هنوز Organization schema ندارد — Phase 12.

---

## امتیاز Phase 0

**Baseline SEO:** ✅ قابل قبول برای placeholder landing  
**Production SEO:** ❌ نیاز به Phase 12

---

## تأیید

- [ ] CTO Review — در انتظار
