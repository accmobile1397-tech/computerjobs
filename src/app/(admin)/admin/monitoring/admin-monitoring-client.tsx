"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMonitoringSummary } from "@/modules/admin/ui/admin-api-client";
import {
  formatCheckStatus,
  formatMonitoringStatus,
  monitoringChecksToRows,
  monitoringCountersToRows,
  type MonitoringCheckRow,
  type MonitoringCounterRow,
  type MonitoringSummaryDto,
} from "@/modules/admin/ui/monitoring";
import { Button } from "@/components/ui/button";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      summary: MonitoringSummaryDto;
      checks: MonitoringCheckRow[];
      counters: MonitoringCounterRow[];
    };

function formatFaNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function AdminMonitoringClient() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    const result = await fetchMonitoringSummary();
    if (!result.success || !result.data) {
      setState({
        status: "error",
        message:
          result.error?.message ??
          "دریافت خلاصه مانیتورینگ از Admin API ناموفق بود",
      });
      return;
    }
    setState({
      status: "ready",
      summary: result.data,
      checks: monitoringChecksToRows(result.data),
      counters: monitoringCountersToRows(result.data),
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <p className="text-sm text-muted-foreground">
        در حال بارگذاری مانیتورینگ…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <p className="text-xs text-muted-foreground">
          دسترسی واقعی توسط سرور با{" "}
          <span dir="ltr">admin:monitoring:read</span> اعمال می‌شود.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void load()}
        >
          تلاش مجدد
        </Button>
      </div>
    );
  }

  const overallOk = state.summary.status === "ok";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">مانیتورینگ</h1>
          <p className="text-sm text-muted-foreground">
            فقط مشاهده — داده از{" "}
            <span dir="ltr" className="font-mono text-xs">
              GET /api/v1/admin/monitoring/summary
            </span>
            . بدون عملیات نگهداری یا دسترسی مستقیم به زیرساخت.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void load()}
        >
          بروزرسانی
        </Button>
      </div>

      <div
        className={`rounded-md border px-4 py-3 ${
          overallOk
            ? "border-border bg-muted/30"
            : "border-destructive/40 bg-destructive/5"
        }`}
      >
        <p className="text-sm text-muted-foreground">وضعیت پلتفرم</p>
        <p className="mt-1 text-2xl font-bold">
          {formatMonitoringStatus(state.summary.status)}
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">
          status: {state.summary.status}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">بررسی سلامت</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {state.checks.map((check) => {
            const ok = check.status === "ok";
            return (
              <div
                key={check.id}
                className="rounded-md border border-border bg-muted/30 px-4 py-3"
              >
                <p className="text-sm text-muted-foreground">{check.label}</p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    ok ? "" : "text-destructive"
                  }`}
                >
                  {formatCheckStatus(check.status)}
                </p>
                <p
                  className="mt-1 font-mono text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {check.id}: {check.status}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">شمارنده‌ها</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {state.counters.map((row) => (
            <div
              key={row.id}
              className="rounded-md border border-border bg-muted/30 px-4 py-3"
            >
              <p className="text-sm text-muted-foreground">{row.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {formatFaNumber(row.value)}
              </p>
              {row.hint ? (
                <p className="mt-1 text-xs text-muted-foreground">{row.hint}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
