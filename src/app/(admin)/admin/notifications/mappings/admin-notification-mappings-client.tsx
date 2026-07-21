"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createNotificationMapping,
  fetchNotificationMappings,
  patchNotificationMapping,
} from "@/modules/admin/ui/admin-api-client";
import {
  formatNotificationDateTime,
  NOTIFICATION_CHANNEL_OPTIONS,
  type NotificationChannelDto,
  type NotificationMappingDto,
  type NotificationMappingListDto,
} from "@/modules/admin/ui/notifications";
import { Button } from "@/components/ui/button";
import { NotificationAdminSubnav } from "../_components/notification-admin-subnav";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: NotificationMappingListDto };

const emptyForm = {
  configVersion: "1",
  eventName: "",
  templateKey: "",
  channel: "EMAIL" as NotificationChannelDto,
  recipientRule: "",
  sortOrder: "0",
  isActive: true,
};

export function AdminNotificationMappingsClient() {
  const [page, setPage] = useState(1);
  const [configVersionFilter, setConfigVersionFilter] = useState("");
  const [appliedVersion, setAppliedVersion] = useState("");
  const [state, setState] = useState<State>({ status: "loading" });
  const [selected, setSelected] = useState<NotificationMappingDto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (p: number, version: string) => {
    setState({ status: "loading" });
    const result = await fetchNotificationMappings({
      page: p,
      limit: 20,
      configVersion: version,
    });
    if (!result.success || !result.data) {
      setState({
        status: "error",
        message: result.error?.message ?? "دریافت نگاشت‌ها ناموفق بود",
      });
      return;
    }
    setState({ status: "ready", data: result.data });
  }, []);

  useEffect(() => {
    void load(page, appliedVersion);
  }, [load, page, appliedVersion]);

  const startCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setMessage(null);
  };

  const selectItem = (item: NotificationMappingDto) => {
    setSelected(item);
    setForm({
      configVersion: String(item.configVersion),
      eventName: item.eventName,
      templateKey: item.templateKey,
      channel: item.channel,
      recipientRule: item.recipientRule,
      sortOrder: String(item.sortOrder),
      isActive: item.isActive,
    });
    setMessage(null);
  };

  const onSave = async () => {
    if (
      !form.eventName.trim() ||
      !form.templateKey.trim() ||
      !form.recipientRule.trim()
    ) {
      setMessage("رویداد، کلید قالب و قانون گیرنده الزامی است");
      return;
    }
    setSaving(true);
    setMessage(null);

    if (selected) {
      const result = await patchNotificationMapping(selected.id, {
        recipientRule: form.recipientRule.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      });
      setSaving(false);
      if (!result.success || !result.data) {
        setMessage(result.error?.message ?? "ویرایش ناموفق بود");
        return;
      }
      setMessage("ویرایش شد");
      await load(page, appliedVersion);
      selectItem(result.data.item);
      return;
    }

    const result = await createNotificationMapping({
      configVersion: Number(form.configVersion) || 1,
      eventName: form.eventName.trim(),
      templateKey: form.templateKey.trim(),
      channel: form.channel,
      recipientRule: form.recipientRule.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    });
    setSaving(false);
    if (!result.success || !result.data) {
      setMessage(result.error?.message ?? "ایجاد ناموفق بود");
      return;
    }
    setMessage("ایجاد شد");
    await load(page, appliedVersion);
    selectItem(result.data.item);
  };

  const totalPages =
    state.status === "ready"
      ? Math.max(1, Math.ceil(state.data.total / state.data.limit))
      : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نگاشت رویداد → اعلان</h1>
        <p className="text-sm text-muted-foreground">
          <span dir="ltr" className="font-mono text-xs">
            GET/POST /api/v1/admin/notifications/mappings
          </span>
        </p>
      </div>

      <NotificationAdminSubnav />

      <form
        className="flex flex-wrap items-end gap-3 rounded-md border border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setAppliedVersion(configVersionFilter);
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span>نسخه پیکربندی</span>
          <input
            dir="ltr"
            className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            placeholder="اختیاری"
            value={configVersionFilter}
            onChange={(e) => setConfigVersionFilter(e.target.value)}
          />
        </label>
        <Button type="submit" size="sm" variant="outline">
          اعمال فیلتر
        </Button>
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
            onClick={() => void load(page, appliedVersion)}
          >
            تلاش مجدد
          </Button>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">فهرست</h2>
              <Button type="button" size="sm" variant="outline" onClick={startCreate}>
                نگاشت جدید
              </Button>
            </div>
            <ul className="max-h-[28rem] space-y-1 overflow-y-auto rounded-md border border-border">
              {state.data.items.length === 0 ? (
                <li className="px-3 py-4 text-sm text-muted-foreground">
                  نگاشتی ثبت نشده است
                </li>
              ) : (
                state.data.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`flex w-full flex-col gap-0.5 px-3 py-2 text-right text-sm transition-colors hover:bg-accent ${
                        selected?.id === item.id ? "bg-muted/50" : ""
                      }`}
                      onClick={() => selectItem(item)}
                    >
                      <span className="font-mono text-xs" dir="ltr">
                        {item.eventName} → {item.templateKey}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        v{item.configVersion} · {item.channel} ·{" "}
                        {item.isActive ? "فعال" : "غیرفعال"} ·{" "}
                        {formatNotificationDateTime(item.updatedAt)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                صفحه {page} از {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  قبلی
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  بعدی
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-md border border-border p-4">
            <h2 className="text-sm font-semibold">
              {selected ? "ویرایش نگاشت" : "ایجاد نگاشت"}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span>نسخه پیکربندی</span>
                <input
                  dir="ltr"
                  type="number"
                  min={1}
                  disabled={Boolean(selected)}
                  className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs disabled:opacity-60"
                  value={form.configVersion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, configVersion: e.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>کانال</span>
                <select
                  dir="ltr"
                  disabled={Boolean(selected)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs disabled:opacity-60"
                  value={form.channel}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      channel: e.target.value as NotificationChannelDto,
                    }))
                  }
                >
                  {NOTIFICATION_CHANNEL_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span>نام رویداد</span>
              <input
                dir="ltr"
                disabled={Boolean(selected)}
                className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs disabled:opacity-60"
                value={form.eventName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventName: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>کلید قالب</span>
              <input
                dir="ltr"
                disabled={Boolean(selected)}
                className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs disabled:opacity-60"
                value={form.templateKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, templateKey: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>قانون گیرنده</span>
              <input
                dir="ltr"
                className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                value={form.recipientRule}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recipientRule: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>ترتیب</span>
              <input
                dir="ltr"
                type="number"
                className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: e.target.value }))
                }
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              <span>فعال</span>
            </label>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" disabled={saving} onClick={() => void onSave()}>
                {saving ? "در حال ذخیره…" : "ذخیره"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void load(page, appliedVersion)}
              >
                بروزرسانی
              </Button>
            </div>
            {message ? (
              <p className="text-xs text-muted-foreground">{message}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
