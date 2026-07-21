"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchNotificationInbox } from "@/modules/admin/ui/admin-api-client";
import {
  DEFAULT_INBOX_FILTERS,
  formatNotificationDateTime,
  formatReadAt,
  type InboxListFilters,
  type NotificationInboxListDto,
} from "@/modules/admin/ui/notifications";
import { Button } from "@/components/ui/button";
import { NotificationAdminSubnav } from "../_components/notification-admin-subnav";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: NotificationInboxListDto };

function formatFaNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

/**
 * C-009-6: read-only inbox viewer.
 * No mark-read, delete, retry, or resend controls.
 */
export function AdminNotificationInboxClient() {
  const [draft, setDraft] = useState<InboxListFilters>(DEFAULT_INBOX_FILTERS);
  const [applied, setApplied] = useState<InboxListFilters>(DEFAULT_INBOX_FILTERS);
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async (filters: InboxListFilters) => {
    setState({ status: "loading" });
    const result = await fetchNotificationInbox(filters);
    if (!result.success || !result.data) {
      setState({
        status: "error",
        message: result.error?.message ?? "دریافت صندوق ورودی ناموفق بود",
      });
      return;
    }
    setState({ status: "ready", data: result.data });
  }, []);

  useEffect(() => {
    void load(applied);
  }, [applied, load]);

  const totalPages =
    state.status === "ready"
      ? Math.max(1, Math.ceil(state.data.total / state.data.limit))
      : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">صندوق ورودی (پشتیبانی)</h1>
        <p className="text-sm text-muted-foreground">
          فقط خواندنی (C-009-6) —{" "}
          <span dir="ltr" className="font-mono text-xs">
            GET /api/v1/admin/notifications/inbox
          </span>
          . بدون mark-read / حذف / retry / resend.
        </p>
      </div>

      <NotificationAdminSubnav />

      <form
        className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied({ ...draft, page: 1 });
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span>ownerId</span>
          <input
            dir="ltr"
            className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            value={draft.ownerId}
            onChange={(e) => setDraft((f) => ({ ...f, ownerId: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>correlationId</span>
          <input
            dir="ltr"
            className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            value={draft.correlationId}
            onChange={(e) =>
              setDraft((f) => ({ ...f, correlationId: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>eventId</span>
          <input
            dir="ltr"
            className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            value={draft.eventId}
            onChange={(e) => setDraft((f) => ({ ...f, eventId: e.target.value }))}
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
          <Button type="submit" size="sm">
            اعمال فیلتر
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setDraft(DEFAULT_INBOX_FILTERS);
              setApplied(DEFAULT_INBOX_FILTERS);
            }}
          >
            پاک کردن
          </Button>
        </div>
      </form>

      {state.status === "loading" ? (
        <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
      ) : null}

      {state.status === "error" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void load(applied)}>
            تلاش مجدد
          </Button>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <div className="space-y-3">
          <ul className="space-y-2">
            {state.data.items.length === 0 ? (
              <li className="rounded-md border border-border px-3 py-6 text-center text-sm text-muted-foreground">
                موردی یافت نشد
              </li>
            ) : (
              state.data.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md border border-border bg-muted/20 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {item.title ?? item.templateKey}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                        {item.content}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatReadAt(item.readAt)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 font-mono text-[11px] text-muted-foreground" dir="ltr">
                    <span>
                      {item.ownerType}:{item.ownerId}
                    </span>
                    <span>{item.templateKey}</span>
                    <span>{item.status}</span>
                    <span>{formatNotificationDateTime(item.createdAt)}</span>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              صفحه {formatFaNumber(applied.page)} از {formatFaNumber(totalPages)} —{" "}
              {formatFaNumber(state.data.total)} مورد
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={applied.page <= 1}
                onClick={() =>
                  setApplied((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
                }
              >
                قبلی
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={applied.page >= totalPages}
                onClick={() => setApplied((f) => ({ ...f, page: f.page + 1 }))}
              >
                بعدی
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
