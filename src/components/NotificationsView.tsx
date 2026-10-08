"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type NotificationData = { enabled: boolean; generatedAt: string; unreadCount: number; notifications: Array<{ id: string; title: string; createdAt: string; unread: boolean; href: string }> };

export default function NotificationsView() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store", signal });
      const result = await response.json(); if (!response.ok) throw new Error(result.message);
      setData(result); setError("");
    } catch (cause) { if (!(cause instanceof Error && cause.name === "AbortError")) setError(cause instanceof Error ? cause.message : "دریافت اعلان‌ها ناموفق بود."); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => refresh(controller.signal));
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(controller.signal); }, 60000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [refresh]);
  const markRead = async () => {
    if (!data || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ readThrough: data.generatedAt }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message);
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "ثبت خواندن اعلان ناموفق بود."); }
    finally { setSaving(false); }
  };
  return <div className="mx-auto max-w-4xl"><h1 className="text-3xl font-black">اعلان‌های من</h1>
    <p className="mt-2 text-sm text-slate-500">گزارش‌ها و تصاویر جدید در پرونده‌های مجاز شما؛ آخرین ۳۰ رویداد نمایش داده می‌شود.</p>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    {!data && !error && <p className="mt-5">در حال دریافت اعلان‌ها...</p>}
    {data && <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="font-bold">{data.unreadCount} اعلان خوانده‌نشده</p><button type="button" disabled={saving || !data.unreadCount} onClick={() => void markRead()} className="rounded-xl bg-sky-500 px-4 py-2 font-bold text-white disabled:opacity-50">{saving ? "در حال ثبت..." : "علامت‌گذاری همه به‌عنوان خوانده‌شده"}</button></div>
      {!data.enabled ? <p>اعلان‌ها غیرفعال‌اند؛ از تنظیمات حساب فعال کنید.</p> : !data.notifications.length ? <p>هنوز رویدادی ثبت نشده است.</p> : <ul className="space-y-3">{data.notifications.map(item => <li key={item.id} className={`rounded-2xl border p-4 ${item.unread ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-slate-50"}`}><Link href={item.href} className="font-bold text-sky-800">{item.title}</Link><time dateTime={item.createdAt} className="mt-2 block text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("fa-IR")}</time>{item.unread && <span className="mt-2 inline-block text-xs text-sky-700">خوانده‌نشده</span>}</li>)}</ul>}
    </section>}
  </div>;
}
