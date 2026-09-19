"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { roleLabels, type AuthSession } from "@/lib/auth";
import { useSession } from "@/lib/useSession";

export default function ProfileView() {
  const { session, isLoading, refresh, logout } = useSession();
  if (isLoading || !session) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">در حال دریافت اطلاعات حساب...</div>;
  }

  return <ProfileForm key={session.user.id} session={session} refresh={refresh} logout={logout} />;
}

function ProfileForm({ session, refresh, logout }: { session: AuthSession; refresh: () => Promise<void>; logout: () => Promise<void> }) {
  const [name, setName] = useState(session.user.name);
  const [phone, setPhone] = useState(session.user.phone);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    if (response.ok) {
      await refresh();
      setMessage("اطلاعات پروفایل با موفقیت به‌روزرسانی شد.");
    } else {
      setMessage("به‌روزرسانی اطلاعات انجام نشد.");
    }
    setIsSaving(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-sky-600">DentVision</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">پروفایل کاربری</h1>
          </div>
          <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">بازگشت به داشبورد</Link>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-l from-sky-50 to-white p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-2xl bg-slate-950 text-2xl font-black text-white">{session.user.name.slice(0, 1)}</div>
              <div>
                <p className="text-xl font-black text-slate-950">{session.user.name}</p>
                <p className="mt-1 text-sm text-slate-500">{roleLabels[session.user.role]}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-sm font-bold text-slate-700">نام و نام خانوادگی</label>
              <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">ایمیل</label>
              <input value={session.user.email} readOnly dir="ltr" className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-left text-sm text-slate-500" />
            </div>
            <div>
              <label htmlFor="profile-phone" className="mb-2 block text-sm font-bold text-slate-700">شماره تماس</label>
              <input id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} required dir="ltr" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
            </div>

            {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">{message}</p>}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
              <button type="submit" disabled={isSaving} className="rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-black text-white hover:bg-sky-600 disabled:opacity-60">{isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}</button>
              <button type="button" onClick={() => void logout()} className="rounded-2xl border border-red-100 bg-red-50 px-6 py-3.5 text-sm font-black text-red-700 hover:bg-red-100">خروج از حساب</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
