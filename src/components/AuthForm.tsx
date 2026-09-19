"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { roleLabels, type Role } from "@/lib/auth";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<Role>("dentist");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/auth/${isSignup ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          ...(isSignup ? { role, invitationCode: formData.get("invitationCode") } : {}),
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
              {isSignup ? "ساخت حساب کاربری" : "ورود به حساب کاربری"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isSignup
                ? "اطلاعات خود را وارد کنید تا حساب آزمایشی شما ساخته شود."
                : "برای ورود به داشبورد، اطلاعات حساب خود را وارد کنید."}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {isSignup && (
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-bold text-slate-700">نام و نام خانوادگی</label>
                  <input id="name" name="name" required autoComplete="name" placeholder="مثلاً دکتر لیلا کریمی" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">ایمیل</label>
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="name@example.com" dir="ltr" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">رمز عبور</label>
                <input id="password" name="password" type="password" required minLength={isSignup ? 8 : 1} maxLength={72} autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isSignup ? "حداقل ۸ کاراکتر" : "رمز عبور"} dir="ltr" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
              </div>
              {isSignup && (
                <div>
                  <label htmlFor="role" className="mb-2 block text-sm font-bold text-slate-700">نقش کاربری</label>
                  <select id="role" value={role} onChange={(event) => setRole(event.target.value as Role)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100">
                    {(Object.entries(roleLabels) as Array<[Role, string]>).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              )}
              {isSignup && role !== "patient" && (
                <div>
                  <label htmlFor="invitationCode" className="mb-2 block text-sm font-bold text-slate-700">کد دعوت کارکنان</label>
                  <input id="invitationCode" name="invitationCode" type="password" required autoComplete="off" placeholder="کد دعوت صادرشده توسط کلینیک" dir="ltr" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </div>
              )}

              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 disabled:cursor-wait disabled:opacity-60">
                {isSubmitting ? "لطفاً صبر کنید..." : isSignup ? "ایجاد حساب" : "ورود به داشبورد"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {isSignup ? "قبلاً حساب ساخته‌اید؟" : "هنوز حساب ندارید؟"}{" "}
              <Link href={isSignup ? "/login" : "/signup"} className="font-black text-sky-600 hover:text-sky-700">
                {isSignup ? "وارد شوید" : "ثبت‌نام کنید"}
              </Link>
            </p>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            اطلاعات حساب به‌صورت امن در دیتابیس DentVision نگهداری می‌شود.
          </p>
        </div>
      </section>
    </main>
  );
}
