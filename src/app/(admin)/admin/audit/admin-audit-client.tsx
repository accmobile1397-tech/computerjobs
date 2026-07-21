"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAuditLogs } from "@/modules/admin/ui/admin-api-client";
import {
  AUDIT_ACTION_FILTER_OPTIONS,
  DEFAULT_AUDIT_FILTERS,
  formatAuditDateTime,
  type AuditListFilters,
  type AuditListResultDto,
} from "@/modules/admin/ui/audit";
import { Button } from "@/components/ui/button";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AuditListResultDto };

function formatFaNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function AdminAuditClient() {
  const [draft, setDraft] = useState<AuditListFilters>(DEFAULT_AUDIT_FILTERS);
  const [applied, setApplied] = useState<AuditListFilters>(DEFAULT_AUDIT_FILTERS);
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async (filters: AuditListFilters) => {
    setState({ status: "loading" });
    const result = await fetchAuditLogs(filters);
    if (!result.success || !result.data) {
      setState({
        status: "error",
        message:
          result.error?.message ?? "دریافت لاگ حسابرسی از Admin API ناموفق بود",
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
      ? Math.max(1, Math.ceil(state.data.total / state.data.pageSize))
      : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">حسابرسی</h1>
        <p className="text-sm text-muted-foreground">
          فقط خواندنی —{" "}
          <span dir="ltr" className="font-mono text-xs">
            GET /api/v1/admin/audit
          </span>
        </p>
      </div>

      <form
        className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied({ ...draft, page: 1 });
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span>عملیات</span>
          <select
            className="rounded-md border border-input bg-background px-3 py-2"
            value={draft.action}
            onChange={(e) =>
              setDraft((f) => ({ ...f, action: e.target.value }))
            }
          >
            <option value="">همه</option>
            {AUDIT_ACTION_FILTER_OPTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>شناسه کاربر</span>
          <input
            dir="ltr"
            className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            placeholder="UUID"
            value={draft.userId}
            onChange={(e) =>
              setDraft((f) => ({ ...f, userId: e.target.value }))
            }
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>از تاریخ</span>
          <input
            type="datetime-local"
            className="rounded-md border border-input bg-background px-3 py-2"
            value={draft.from}
            onChange={(e) => setDraft((f) => ({ ...f, from: e.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>تا تاریخ</span>
          <input
            type="datetime-local"
            className="rounded-md border border-input bg-background px-3 py-2"
            value={draft.to}
            onChange={(e) => setDraft((f) => ({ ...f, to: e.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>اندازه صفحه</span>
          <select
            className="rounded-md border border-input bg-background px-3 py-2"
            value={draft.pageSize}
            onChange={(e) =>
              setDraft((f) => ({
                ...f,
                pageSize: Number(e.target.value),
              }))
            }
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {formatFaNumber(n)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <Button type="submit" size="sm">
            اعمال فیلتر
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setDraft(DEFAULT_AUDIT_FILTERS);
              setApplied(DEFAULT_AUDIT_FILTERS);
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load(applied)}
          >
            تلاش مجدد
          </Button>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            مجموع: {formatFaNumber(state.data.total)} · صفحه{" "}
            {formatFaNumber(state.data.page)} از {formatFaNumber(totalPages)}
          </p>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-right">
                <tr>
                  <th className="px-3 py-2 font-medium">زمان</th>
                  <th className="px-3 py-2 font-medium">عملیات</th>
                  <th className="px-3 py-2 font-medium">کاربر</th>
                  <th className="px-3 py-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {state.data.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-muted-foreground"
                    >
                      موردی یافت نشد
                    </td>
                  </tr>
                ) : (
                  state.data.items.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatAuditDateTime(row.createdAt)}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {row.action}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {row.userId ?? "—"}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {row.ipAddress ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
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
              onClick={() =>
                setApplied((f) => ({ ...f, page: f.page + 1 }))
              }
            >
              بعدی
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
