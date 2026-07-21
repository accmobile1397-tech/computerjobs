/**
 * Public SSR shell layout (P12-001).
 * Route group `(public)` is organizational only — URLs unchanged (`/` stays `/`).
 * Header/footer chrome only — no business logic, Prisma, or domain pages.
 */
import { PublicSiteFooter } from "./_components/public-site-footer";
import { PublicSiteHeader } from "./_components/public-site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicSiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <PublicSiteFooter />
    </div>
  );
}
