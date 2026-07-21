"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminSettings,
  putAdminSetting,
} from "@/modules/admin/ui/admin-api-client";
import {
  formatSettingUpdatedAt,
  formatSettingValueForEditor,
  isFeatureSettingKey,
  parseSettingEditorValue,
  type SystemSettingItemDto,
} from "@/modules/admin/ui/settings";
import { Button } from "@/components/ui/button";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: SystemSettingItemDto[] };

export function AdminSettingsClient() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [editorKey, setEditorKey] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    setSaveMessage(null);
    const result = await fetchAdminSettings();
    if (!result.success || !result.data) {
      setState({
        status: "error",
        message:
          result.error?.message ?? "دریافت تنظیمات از Admin API ناموفق بود",
      });
      return;
    }
    setState({ status: "ready", items: result.data.items });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectItem = (item: SystemSettingItemDto) => {
    setSelectedKey(item.key);
    setEditorKey(item.key);
    setEditorValue(formatSettingValueForEditor(item));
    setSaveMessage(null);
  };

  const startCreate = () => {
    setSelectedKey("");
    setEditorKey("");
    setEditorValue("");
    setSaveMessage(null);
  };

  const onSave = async () => {
    const key = editorKey.trim();
    if (!key) {
      setSaveMessage("کلید تنظیمات الزامی است");
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    const result = await putAdminSetting({
      key,
      value: parseSettingEditorValue(editorValue),
    });
    setSaving(false);
    if (!result.success || !result.data) {
      setSaveMessage(result.error?.message ?? "ذخیره ناموفق بود");
      return;
    }
    setSaveMessage("ذخیره شد (از طریق Admin API + audit سمت سرور)");
    await load();
    selectItem(result.data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تنظیمات</h1>
        <p className="text-sm text-muted-foreground">
          فقط{" "}
          <span dir="ltr" className="font-mono text-xs">
            GET/PUT /api/v1/admin/settings
          </span>
          — مقادیر حساس توسط سرور ماسک می‌شوند.{" "}
          <span dir="ltr">feature.*</span> تنظیم عادی است (بدون Feature Flag
          Engine).
        </p>
      </div>

      {state.status === "loading" ? (
        <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
      ) : null}

      {state.status === "error" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
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
                تنظیم جدید
              </Button>
            </div>
            <ul className="max-h-[28rem] space-y-1 overflow-y-auto rounded-md border border-border">
              {state.items.length === 0 ? (
                <li className="px-3 py-4 text-sm text-muted-foreground">
                  تنظیماتی ثبت نشده است
                </li>
              ) : (
                state.items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      className={`flex w-full flex-col gap-0.5 px-3 py-2 text-right text-sm transition-colors hover:bg-accent ${
                        selectedKey === item.key ? "bg-muted/50" : ""
                      }`}
                      onClick={() => selectItem(item)}
                    >
                      <span className="font-mono text-xs" dir="ltr">
                        {item.key}
                      </span>
                      <span className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {item.masked ? (
                          <span className="rounded bg-muted px-1.5 py-0.5">ماسک‌شده</span>
                        ) : null}
                        {isFeatureSettingKey(item.key) ? (
                          <span className="rounded bg-muted px-1.5 py-0.5">
                            feature.*
                          </span>
                        ) : null}
                        <span>{formatSettingUpdatedAt(item.updatedAt)}</span>
                      </span>
                      <span className="truncate font-mono text-xs text-muted-foreground" dir="ltr">
                        {item.masked ? "***" : String(item.value)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="space-y-3 rounded-md border border-border p-4">
            <h2 className="text-sm font-semibold">ویرایش / ایجاد</h2>
            {state.items.find((i) => i.key === selectedKey)?.masked ? (
              <p className="text-xs text-muted-foreground">
                مقدار فعلی مخفی است. فقط می‌توانید مقدار جدید جایگزین کنید — UI هرگز
                secret/token/key را نشان نمی‌دهد.
              </p>
            ) : null}

            <label className="flex flex-col gap-1 text-sm">
              <span>کلید</span>
              <input
                dir="ltr"
                className="rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                value={editorKey}
                onChange={(e) => setEditorKey(e.target.value)}
                placeholder="feature.demo یا billing.timezone"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>مقدار (JSON یا متن)</span>
              <textarea
                dir="ltr"
                className="min-h-32 rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
                value={editorValue}
                onChange={(e) => setEditorValue(e.target.value)}
                placeholder={
                  state.items.find((i) => i.key === selectedKey)?.masked
                    ? "مقدار جدید…"
                    : '{"enabled":true}'
                }
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" disabled={saving} onClick={() => void onSave()}>
                {saving ? "در حال ذخیره…" : "ذخیره"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
                بروزرسانی فهرست
              </Button>
            </div>
            {saveMessage ? (
              <p className="text-xs text-muted-foreground">{saveMessage}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
