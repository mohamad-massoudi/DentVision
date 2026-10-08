"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { AuthUser } from "@/lib/auth";
import NotificationSettings from "./NotificationSettings";

type Clinic = { id: string; name: string; phone: string; address: string };

export default function SettingsView({ user, refresh }: { user: AuthUser; refresh: () => Promise<void> }) {
  return <SettingsForm key={`${user.id}:${user.clinicId ?? ""}`} user={user} refresh={refresh} />;
}

function SettingsForm({ user, refresh }: { user: AuthUser; refresh: () => Promise<void> }) {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(user.role === "DENTIST" && Boolean(user.clinicId));
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (user.role !== "DENTIST") return;
    if (!user.clinicId) return;
    const controller = new AbortController();
    fetch(`/api/clinics/${encodeURIComponent(user.clinicId)}`, { cache: "no-store", signal: controller.signal })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message); setClinic(data.clinic); })
      .catch(cause => { if (cause.name !== "AbortError") setMessage(cause.message ?? "دریافت تنظیمات ناموفق بود."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [user.role, user.clinicId]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (saving) return;
    const data = new FormData(event.currentTarget);
    const dentist = user.role === "DENTIST";
    if (dentist && !clinic) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(dentist ? `/api/clinics/${encodeURIComponent(clinic!.id)}` : "/api/user/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dentist ? { name: data.get("name"), phone: data.get("phone"), address: data.get("address") } : { name: data.get("name"), phone: data.get("phone") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "ذخیره تنظیمات ناموفق بود.");
      if (dentist) setClinic(result.clinic);
      await refresh();
      setMessage("تنظیمات با موفقیت در پایگاه داده ذخیره شد.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "ارتباط با سرور برقرار نشد."); }
    finally { setSaving(false); }
  };
  return <div className="mx-auto max-w-3xl">
    <h1 className="text-3xl font-black">{user.role === "DENTIST" ? "تنظیمات مطب" : "تنظیمات حساب کاربری"}</h1>
    {loading ? <p className="mt-5">در حال دریافت اطلاعات مطب...</p> : user.role === "DENTIST" && !clinic ? <p className="mt-5 text-red-700">{message || "حساب شما به مطب متصل نیست."}</p> :
      <form key={clinic?.id ?? user.id} onSubmit={event => void submit(event)} className="mt-8 space-y-5 rounded-3xl border border-slate-200 bg-white p-6">
        <fieldset disabled={saving} className="space-y-5">
          <label className="block">{clinic ? "نام مطب" : "نام و نام خانوادگی"}<input name="name" required maxLength={150} defaultValue={clinic?.name ?? user.name} className="field mt-2" /></label>
          <label className="block">شماره تماس<input name="phone" required minLength={7} maxLength={20} defaultValue={clinic?.phone ?? user.phone} dir="ltr" className="field mt-2" /></label>
          {clinic && <label className="block">آدرس مطب<textarea name="address" required maxLength={1000} defaultValue={clinic.address} rows={3} className="field mt-2" /></label>}
        </fieldset>
        {message && <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}
        <button disabled={saving} className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}</button>
      </form>}
    <NotificationSettings />
    <Link href="/profile" className="mt-4 inline-block font-bold text-sky-700">پروفایل و تغییر رمز عبور</Link>
  </div>;
}
