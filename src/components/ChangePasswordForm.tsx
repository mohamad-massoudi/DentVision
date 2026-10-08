"use client";
import { useState, type FormEvent } from "react";

export default function ChangePasswordForm() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (saving) return;
    const form = event.currentTarget, data = new FormData(form);
    if (data.get("newPassword") !== data.get("confirmation")) { setFailed(true); setMessage("تکرار رمز جدید مطابقت ندارد."); return; }
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/user/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: data.get("currentPassword"), newPassword: data.get("newPassword") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "تغییر رمز ناموفق بود.");
      form.reset(); setFailed(false); setMessage(result.message);
    } catch (cause) { setFailed(true); setMessage(cause instanceof Error ? cause.message : "ارتباط با سرور برقرار نشد."); }
    finally { setSaving(false); }
  };
  return <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-xl font-black">تغییر رمز عبور</h2>
    <form onSubmit={event => void submit(event)} className="mt-4 space-y-4">
      <fieldset disabled={saving} className="space-y-4">
        <label className="block">رمز فعلی<input name="currentPassword" type="password" autoComplete="current-password" required className="field mt-1" dir="ltr" /></label>
        <label className="block">رمز جدید<input name="newPassword" type="password" autoComplete="new-password" minLength={8} required className="field mt-1" dir="ltr" /></label>
        <label className="block">تکرار رمز جدید<input name="confirmation" type="password" autoComplete="new-password" minLength={8} required className="field mt-1" dir="ltr" /></label>
      </fieldset>
      <p className="text-xs text-slate-500">حداقل ۸ نویسه و حداکثر ۷۲ بایت؛ رمز فعلی برای تأیید لازم است.</p>
      {message && <p role="status" className={`rounded-xl p-3 text-sm ${failed ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{message}</p>}
      <button disabled={saving} className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "در حال تغییر..." : "تغییر رمز عبور"}</button>
    </form>
  </section>;
}
