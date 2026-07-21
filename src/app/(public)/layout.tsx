/**
 * Public SSR shell layout (P12-001).
 * Wraps Option 1 public routes — not admin/dashboard/profile (C-012-10).
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
