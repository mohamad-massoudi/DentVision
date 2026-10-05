"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AuthForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.get("identifier"),
          password: formData.get("password"),
        }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message);
      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "خطایی رخ داد. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.8fr)]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 -top-24 size-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-20 size-96 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
              <path d="M8.2 3.5c1.2 0 2.3.6 3.8.6s2.6-.6 3.8-.6c2.6 0 4.2 2.1 4.2 4.7 0 2.1-.8 3.5-1.5 5-.8 1.7-1.1 3.2-1.5 5.1-.3 1.4-.8 2.2-1.7 2.2-1.2 0-1.4-1.8-1.8-3.4-.3-1.2-.7-2.1-1.5-2.1s-1.2.9-1.5 2.1c-.4 1.6-.6 3.4-1.8 3.4-.9 0-1.4-.8-1.7-2.2-.4-1.9-.7-3.4-1.5-5.1-.7-1.5-1.5-2.9-1.5-5 0-2.6 1.6-4.7 4.2-4.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black">DentVision</p>
            <p className="text-xs text-slate-400">دستیار هوشمند دندان‌پزشکی</p>
          </div>
        </div>
        <div className="relative max-w-xl">
          <p className="text-sm font-bold text-sky-400">مدیریت هوشمند کلینیک</p>
          <h1 className="mt-5 text-4xl font-black leading-tight xl:text-5xl">
            پرونده‌های دقیق‌تر، تصمیم‌های سریع‌تر
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-400">
            تصاویر دندان، سوابق درمان و گزارش بیماران را در یک محیط امن و یکپارچه مدیریت کنید.
          </p>
        </div>
        <p className="relative text-xs text-slate-500">نسخه آزمایشی DentVision MVP</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-500 text-white">D</div>
            <p className="text-xl font-black">DentVision</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-slate-950">
              ورود به حساب کاربری
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              حساب‌ها فقط توسط مدیر مجاز سیستم یا پزشک مطب ساخته می‌شوند.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="identifier" className="mb-2 block text-sm font-bold text-slate-700">نام کاربری یا ایمیل</label>
                <input id="identifier" name="identifier" required autoComplete="username" placeholder="mohamadm" dir="ltr" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">رمز عبور</label>
                <input id="password" name="password" type="password" required maxLength={72} autoComplete="current-password" placeholder="رمز عبور" dir="ltr" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
              </div>

              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 disabled:cursor-wait disabled:opacity-60">
                {isSubmitting ? "لطفاً صبر کنید..." : "ورود به داشبورد"}
              </button>
            </form>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            اطلاعات حساب به‌صورت امن در دیتابیس DentVision نگهداری می‌شود.
          </p>
        </div>
      </section>
    </main>
  );
}
