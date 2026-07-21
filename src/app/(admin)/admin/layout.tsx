import type { Metadata } from "next";
import { AdminAuthGate } from "./_components/admin-auth-gate";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

/**
 * Admin shell layout (P10-008).
 * C-005-1: no Prisma / DB clients — auth via HTTP (/users/me) + Admin APIs later.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <p className="text-sm font-bold tracking-tight">
          ComputerJobs.ir — پنل مدیریت
        </p>
      </header>
      <AdminAuthGate>{children}</AdminAuthGate>
    </div>
  );
}
