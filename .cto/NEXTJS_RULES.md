# Next.js Rules

## Stack

- Next.js App Router, TypeScript, TailwindCSS v4, shadcn/ui  

## App Router

- `src/app/` — pages, layouts, metadata only  
- `src/components/` — shared UI (no business logic)  
- API routes: `src/app/api/v1/{resource}/route.ts` — thin handlers  

## API Routes

- Import services from `src/modules/{feature}/`  
- Use `@/modules/shared/api/response` envelope  
- Version: `/api/v1/`  

## UI Rules

- Persian first, RTL default (`dir="rtl"`, `lang="fa"`)  
- Mobile first, accessibility required  
- Font: **Vazirmatn** via `next/font`  
- Reusable components — avoid duplication  

## Pages

- SSR/SSG per SEO needs  
- Dynamic metadata on every public page  
- No business logic in `page.tsx` — use server components calling module services  

## Middleware

- Security headers in `src/middleware.ts`  

See [SEO_RULES.md](./SEO_RULES.md) for public pages.
