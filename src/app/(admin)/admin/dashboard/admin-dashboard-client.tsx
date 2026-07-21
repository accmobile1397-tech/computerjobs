"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDashboardSummary } from "@/modules/admin/ui/admin-api-client";
import {
  dashboardSummaryToKpis,
  type DashboardKpi,
  type DashboardSummaryDto,
} from "@/modules/admin/ui/dashboard";
import { Button } from "@/components/ui/button";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: DashboardSummaryDto; kpis: DashboardKpi[] };

function formatFaNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function AdminDashboardClient() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    const result = await fetchDashboardSummary();
    if (!result.success || !result.data) {
      setState({
        status: "error",
        message:
          result.error?.message ??
          "دریافت خلاصه داشبورد از Admin API ناموفق بود",
      });
      return;
    }
    setState({
      status: "ready",
      summary: result.data,
      kpis: dashboardSummaryToKpis(result.data),
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <p className="text-sm text-muted-foreground">در حال بارگذاری داشبورد…</p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <p className="text-xs text-muted-foreground">
          دسترسی واقعی توسط سرور با{" "}
          <span dir="ltr">admin:dashboard:read</span> اعمال می‌شود.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">داشبورد</h1>
          <p className="text-sm text-muted-foreground">
            شاخص‌ها فقط از{" "}
            <span dir="ltr" className="font-mono text-xs">
              GET /api/v1/admin/dashboard/summary
            </span>
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
          بروزرسانی
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {state.kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="rounded-md border border-border bg-muted/30 px-4 py-3"
          >
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatFaNumber(kpi.value)}
            </p>
            {kpi.hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
