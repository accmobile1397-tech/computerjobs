"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createNotificationTemplate,
  fetchNotificationTemplates,
  patchNotificationTemplate,
  softDeleteNotificationTemplate,
} from "@/modules/admin/ui/admin-api-client";
import {
  formatNotificationDateTime,
  NOTIFICATION_CHANNEL_OPTIONS,
  type NotificationChannelDto,
  type NotificationTemplateDto,
  type NotificationTemplateListDto,
} from "@/modules/admin/ui/notifications";
import { Button } from "@/components/ui/button";
import { NotificationAdminSubnav } from "../_components/notification-admin-subnav";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: NotificationTemplateListDto };

const emptyForm = {
  templateKey: "",
  version: "1",
  channel: "EMAIL" as NotificationChannelDto,
  locale: "fa-IR",
  subject: "",
  body: "",
  isActive: true,
};

export function AdminNotificationTemplatesClient() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<State>({ status: "loading" });
  const [selected, setSelected] = useState<NotificationTemplateDto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setState({ status: "loading" });
    const result = await fetchNotificationTemplates({ page: p, limit: 20 });
    if (!result.success || !result.data) {
      setState({
        status: "error",
        message: result.error?.message ?? "دریافت قالب‌ها ناموفق بود",
      });
      return;
    }
    setState({ status: "ready", data: result.data });
  }, []);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  const startCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setMessage(null);
  };

  const selectItem = (item: NotificationTemplateDto) => {
    setSelected(item);
    setForm({
      templateKey: item.templateKey,
      version: String(item.version),
      channel: item.channel,
      locale: item.locale,
      subject: item.subject ?? "",
      body: item.body,
      isActive: item.isActive,
    });
    setMessage(null);
  };

  const onSave = async () => {
    if (!form.templateKey.trim() || !form.body.trim()) {
      setMessage("کلید قالب و متن بدنه الزامی است");
      return;
    }
    setSaving(true);
    setMessage(null);

    if (selected) {
      const result = await patchNotificationTemplate(selected.id, {
        subject: form.subject.trim() ? form.subject : null,
        body: form.body,
        locale: form.locale.trim() || "fa-IR",
        isActive: form.isActive,
      });
      setSaving(false);
      if (!result.success || !result.data) {
        setMessage(result.error?.message ?? "ویرایش ناموفق بود");
        return;
      }
      setMessage("ویرایش شد");
      await load(page);
      selectItem(result.data.item);
      return;
    }

    const result = await createNotificationTemplate({
      templateKey: form.templateKey.trim(),
      version: Number(form.version) || 1,
      channel: form.channel,
      locale: form.locale.trim() || "fa-IR",
      subject: form.subject.trim() ? form.subject : null,
      body: form.body,
      isActive: form.isActive,
    });
    setSaving(false);
    if (!result.success || !result.data) {
      setMessage(result.error?.message ?? "ایجاد ناموفق بود");
      return;
    }
    setMessage("ایجاد شد");
    await load(page);
    selectItem(result.data.item);
  };

  const onSoftDelete = async () => {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    const result = await softDeleteNotificationTemplate(selected.id);
    setSaving(false);
    if (!result.success) {
      setMessage(result.error?.message ?? "حذف نرم ناموفق بود");
      return;
    }
    setMessage("حذف نرم انجام شد");
    setSelected(null);
    setForm(emptyForm);
    await load(page);
  };

  const totalPages =
    state.status === "ready"
      ? Math.max(1, Math.ceil(state.data.total / state.data.limit))
      : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">قالب‌های اعلان</h1>
        <p className="text-sm text-muted-foreground">
          <span dir="ltr" className="font-mono text-xs">
            GET/POST /api/v1/admin/notifications/templates
          </span>
        </p>
      </div>

      <NotificationAdminSubnav />

      {state.status === "loading" ? (
        <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
      ) : null}

      {state.status === "error" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void load(page)}>
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
                قالب جدید
              </Button>
            </div>
            <ul className="max-h-[28rem] space-y-1 overflow-y-auto rounded-md border border-border">
              {state.data.items.length === 0 ? (
                <li className="px-3 py-4 text-sm text-muted-foreground">
                  قالبی ثبت نشده است
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
                        {item.templateKey} · v{item.version} · {item.channel}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
                صفحه {page} از {totalPages} —{" "}
                {new Intl.NumberFormat("fa-IR").format(state.data.total)} مورد
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
              {selected ? "ویرایش قالب" : "ایجاد قالب"}
            </h2>

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

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span>نسخه</span>
                <input
                  dir="ltr"
                  type="number"
                  min={1}
                  disabled={Boolean(selected)}
                  className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs disabled:opacity-60"
                  value={form.version}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, version: e.target.value }))
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
              <span>locale</span>
              <input
                dir="ltr"
                className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                value={form.locale}
                onChange={(e) =>
                  setForm((f) => ({ ...f, locale: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>موضوع (اختیاری)</span>
              <input
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>بدنه</span>
              <textarea
                className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.body}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body: e.target.value }))
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
              {selected ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={saving}
                  onClick={() => void onSoftDelete()}
                >
                  حذف نرم
                </Button>
              ) : null}
              <Button type="button" size="sm" variant="outline" onClick={() => void load(page)}>
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
