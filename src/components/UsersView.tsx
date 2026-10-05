"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type FormEvent } from "react";
import type { Role } from "@/lib/auth";

interface UserRow { id: string; username: string | null; name: string; role: string; clinic?: { name: string } | null }

export default function UsersView({ role }: { role: Role }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [clinics, setClinics] = useState<Array<{ id: string; name: string }>>([]);
  const load = async () => { const response = await fetch("/api/users"); const data = await response.json(); if (!response.ok) throw new Error(data.message); setUsers(data.users ?? []); };
  useEffect(() => { void load().catch((error: Error) => setMessage(error.message)); }, []);
  useEffect(() => { if (role === "SUPER_ADMIN") void fetch("/api/clinics").then(r => r.json()).then(d => setClinics(d.clinics ?? [])); }, [role]);
  const create = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const submittedForm = event.currentTarget; setIsSaving(true); setMessage(""); const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(submittedForm).entries())) }); const data = await response.json(); setIsSaving(false); if (!response.ok) return setMessage(data.message ?? "ساخت حساب ناموفق بود."); submittedForm.reset(); setMessage("حساب با موفقیت ساخته شد."); void load(); };
  return <div className="mx-auto max-w-6xl"><h1 className="text-3xl font-black">کاربران سیستم</h1><p className="mt-2 text-sm text-slate-500">مدیریت حساب‌های مجاز کلینیک.</p><form onSubmit={create} className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-3"><input name="name" required placeholder="نام و نام خانوادگی" className="field"/><input name="username" required placeholder="نام کاربری" className="field"/><input name="password" required minLength={8} type="password" placeholder="رمز عبور (حداقل ۸ نویسه)" className="field"/>{role === "SUPER_ADMIN" ? <><select name="role" required className="field"><option value="DENTIST">پزشک</option><option value="STAFF">منشی</option></select><select name="clinicId" required className="field"><option value="">انتخاب کلینیک</option>{clinics.map(clinic => <option key={clinic.id} value={clinic.id}>{clinic.name}</option>)}</select></> : <input name="role" value="STAFF" readOnly aria-label="نقش منشی" className="field"/>}<input name="email" type="email" placeholder="ایمیل اختیاری" className="field"/><button disabled={isSaving} className="rounded-2xl bg-sky-500 px-4 py-3 font-black text-white disabled:opacity-60">{isSaving ? "در حال ساخت..." : "ساخت حساب"}</button></form>{message && <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}<div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white p-5"><table className="w-full min-w-[600px] text-right text-sm"><thead><tr className="border-b text-slate-400"><th className="p-3">نام</th><th className="p-3">نام کاربری</th><th className="p-3">نقش</th><th className="p-3">کلینیک</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b last:border-0"><td className="p-3 font-bold">{user.name}</td><td className="p-3" dir="ltr">{user.username ?? "—"}</td><td className="p-3">{user.role}</td><td className="p-3">{user.clinic?.name ?? "سیستم"}</td></tr>)}</tbody></table></div></div>;
}
