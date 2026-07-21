"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchNotificationDeliveries } from "@/modules/admin/ui/admin-api-client";
import {
  DEFAULT_DELIVERY_FILTERS,
  formatNotificationDateTime,
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_DELIVERY_STATUS_OPTIONS,
  type DeliveryListFilters,
  type NotificationDeliveryListDto,
} from "@/modules/admin/ui/notifications";
import { Button } from "@/components/ui/button";
import { NotificationAdminSubnav } from "../_components/notification-admin-subnav";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: NotificationDeliveryListDto };

function formatFaNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

/** Read-only delivery viewer — no retry / resend / provider actions. */
export function AdminNotificationDeliveriesClient() {
  const [draft, setDraft] = useState<DeliveryListFilters>(DEFAULT_DELIVERY_FILTERS);
  const [applied, setApplied] = useState<DeliveryListFilters>(DEFAULT_DELIVERY_FILTERS);
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async (filters: DeliveryListFilters) => {
    setState({ status: "loading" });
    const result = await fetchNotificationDeliveries(filters);
    if (!result.success || !result.data) {
      setState({
        status: "error",
        message: result.error?.message ?? "دریافت تحویل‌ها ناموفق بود",
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
        <h1 className="text-2xl font-bold">تحویل اعلان‌ها</h1>
        <p className="text-sm text-muted-foreground">
          فقط خواندنی —{" "}
          <span dir="ltr" className="font-mono text-xs">
            GET /api/v1/admin/notifications/deliveries
          </span>
          . بدون retry / resend / مدیریت provider.
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
          <span>وضعیت</span>
          <select
            dir="ltr"
            className="rounded-md border border-input bg-background px-3 py-2 text-xs"
            value={draft.status}
            onChange={(e) => setDraft((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">همه</option>
            {NOTIFICATION_DELIVERY_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>کانال</span>
          <select
            dir="ltr"
            className="rounded-md border border-input bg-background px-3 py-2 text-xs"
            value={draft.channel}
            onChange={(e) => setDraft((f) => ({ ...f, channel: e.target.value }))}
          >
            <option value="">همه</option>
            {NOTIFICATION_CHANNEL_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>کلید قالب</span>
          <input
            dir="ltr"
            className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            value={draft.templateKey}
            onChange={(e) =>
              setDraft((f) => ({ ...f, templateKey: e.target.value }))
            }
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>نام رویداد</span>
          <input
            dir="ltr"
            className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            value={draft.eventName}
            onChange={(e) =>
              setDraft((f) => ({ ...f, eventName: e.target.value }))
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

        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
          <Button type="submit" size="sm">
            اعمال فیلتر
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setDraft(DEFAULT_DELIVERY_FILTERS);
              setApplied(DEFAULT_DELIVERY_FILTERS);
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
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[48rem] text-right text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">وضعیت</th>
                  <th className="px-3 py-2 font-medium">کانال</th>
                  <th className="px-3 py-2 font-medium">قالب</th>
                  <th className="px-3 py-2 font-medium">رویداد</th>
                  <th className="px-3 py-2 font-medium">گیرنده</th>
                  <th className="px-3 py-2 font-medium">زمان</th>
                </tr>
              </thead>
              <tbody>
                {state.data.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-muted-foreground"
                    >
                      موردی یافت نشد
                    </td>
                  </tr>
                ) : (
                  state.data.items.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {item.status}
                        {item.lastErrorCode ? (
                          <span className="block text-destructive">
                            {item.lastErrorCode}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {item.channel}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {item.templateKey}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {item.eventName ?? item.eventId}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {item.recipientType}:{item.recipientId}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {formatNotificationDateTime(item.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
