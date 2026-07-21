"use client";

import { useCallback, useEffect, useState } from "react";
import {
  canAccessAdminPanel,
  fetchAdminBootstrap,
  getAdminAccessToken,
  setAdminAccessToken,
  type MeBootstrap,
  ADMIN_NAV_ITEMS,
} from "@/modules/admin/ui";
import { AdminNav } from "./admin-nav";
import { Button } from "@/components/ui/button";

type GateState =
  | { status: "loading" }
  | { status: "need_token" }
  | { status: "denied"; message: string }
  | { status: "ready"; user: MeBootstrap };

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>({ status: "loading" });
  const [tokenInput, setTokenInput] = useState("");

  const bootstrap = useCallback(async () => {
    const token = getAdminAccessToken();
    if (!token) {
      setState({ status: "need_token" });
      return;
    }

    setState({ status: "loading" });
    const result = await fetchAdminBootstrap();
    if (!result.success || !result.data) {
      setState({
        status: "denied",
        message: result.error?.message ?? "احراز هویت ناموفق بود",
      });
      return;
    }

    const { permissions, roles } = result.data;
    if (!canAccessAdminPanel(permissions, roles)) {
      setState({
        status: "denied",
        message: "شما به پنل مدیریت دسترسی ندارید",
      });
      return;
    }

    setState({ status: "ready", user: result.data });
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        در حال بررسی دسترسی…
      </div>
    );
  }

  if (state.status === "need_token" || state.status === "denied") {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 p-6">
        <h1 className="text-xl font-bold">ورود به پنل مدیریت</h1>
        <p className="text-sm text-muted-foreground">
          {state.status === "denied"
            ? state.message
            : "توکن دسترسی (Bearer) را وارد کنید. داده فقط از طریق Admin API خوانده می‌شود."}
        </p>
        <label className="text-sm font-medium" htmlFor="admin-token">
          Access Token
        </label>
        <textarea
          id="admin-token"
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="eyJ..."
          dir="ltr"
        />
        <Button
          type="button"
          onClick={() => {
            if (!tokenInput.trim()) return;
            setAdminAccessToken(tokenInput);
            void bootstrap();
          }}
        >
          ادامه
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <AdminNav
        email={state.user.email}
        permissions={state.user.permissions}
        roles={state.user.roles}
        items={ADMIN_NAV_ITEMS}
      />
      <main className="flex flex-1 flex-col p-4 md:p-6">{children}</main>
    </div>
  );
}
