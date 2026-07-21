import Link from "next/link";
import { NOTIFICATION_HUB_LINKS } from "@/modules/admin/ui/notifications";
import { NotificationAdminSubnav } from "./_components/notification-admin-subnav";

/** P10-013 — notification admin hub (Phase 9 APIs). */
export default function AdminNotificationsHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">اعلان‌ها</h1>
        <p className="text-sm text-muted-foreground">
          مصرف‌کنندهٔ{" "}
          <span dir="ltr" className="font-mono text-xs">
            /api/v1/admin/notifications/*
          </span>{" "}
          (فاز ۹). صندوق ورودی فقط خواندنی است (C-009-6).
        </p>
      </div>

      <NotificationAdminSubnav />

      <ul className="grid gap-3 sm:grid-cols-2">
        {NOTIFICATION_HUB_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-accent"
            >
              <p className="font-semibold">
                {item.label}
                {item.readOnly ? (
                  <span className="mr-2 text-xs font-normal text-muted-foreground">
                    فقط خواندنی
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
