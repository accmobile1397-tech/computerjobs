"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NOTIFICATION_HUB_LINKS } from "@/modules/admin/ui/notifications";

export function NotificationAdminSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 rounded-md border border-border p-1">
      <Link
        href="/admin/notifications"
        className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
          pathname === "/admin/notifications"
            ? "bg-foreground text-background"
            : "hover:bg-accent"
        }`}
      >
        فهرست
      </Link>
      {NOTIFICATION_HUB_LINKS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
              active ? "bg-foreground text-background" : "hover:bg-accent"
            }`}
          >
            {item.label}
            {item.readOnly ? (
              <span className="mr-1 text-[10px] opacity-70"> (خواندنی)</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
