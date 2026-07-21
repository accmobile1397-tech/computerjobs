"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { filterAdminNav, type AdminNavItem } from "@/modules/admin/ui/nav";
import { clearAdminAccessToken } from "@/modules/admin/ui/token";

type Props = {
  permissions: string[];
  roles: string[];
  email: string;
  items?: readonly AdminNavItem[];
};

export function AdminNav({ permissions, roles, email, items }: Props) {
  const pathname = usePathname();
  const visible = filterAdminNav(items ?? [], permissions, roles);

  return (
    <aside className="flex w-full flex-col border-b border-border bg-muted/40 md:w-56 md:border-b-0 md:border-l md:border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
        <div>
          <p className="text-sm font-bold">پنل مدیریت</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => {
            clearAdminAccessToken();
            window.location.href = "/admin";
          }}
        >
          خروج
        </button>
      </div>
      <nav className="flex flex-row gap-1 overflow-x-auto p-2 md:flex-col">
        {visible.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
