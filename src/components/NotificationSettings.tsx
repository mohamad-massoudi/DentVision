"use client";
import { useEffect, useState } from "react";

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/notifications", { cache: "no-store", signal: controller.signal }).then(async response => {
      const result = await response.json(); if (!response.ok) throw new Error(result.message);
      setEnabled(result.enabled);
    }).catch(error => { if (error.name !== "AbortError") setMessage(error.message ?? "دریافت تنظیمات ناموفق بود."); });
    return () => controller.abort();
  }, []);
  const save = async () => {
    if (enabled === null || saving) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message);
      setMessage("ترجیح اعلان‌ها در پایگاه داده ذخیره شد.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "ذخیره تنظیمات ناموفق بود."); }
    finally { setSaving(false); }
  };
  return <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">اعلان‌های داخل پنل</h2>
    <label className="mt-4 flex items-center gap-3"><input type="checkbox" checked={enabled ?? false} disabled={enabled === null || saving} onChange={event => setEnabled(event.target.checked)} />نمایش اعلان گزارش و تصویر جدید پرونده</label>
    <p className="mt-3 text-sm text-slate-500">فقط رویدادهای پرونده‌های مجاز خودتان نمایش داده می‌شوند؛ ارسال ایمیل یا پیامک انجام نمی‌شود.</p>
    <button type="button" onClick={() => void save()} disabled={enabled === null || saving} className="mt-4 rounded-xl bg-sky-500 px-4 py-2 font-bold text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : "ذخیره ترجیح اعلان"}</button>
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
  </section>;
}
