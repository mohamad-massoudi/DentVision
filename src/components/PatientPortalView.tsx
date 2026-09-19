import type { AuthUser } from "@/lib/auth";

export default function PatientPortalView({ mode, user }: { mode: "record" | "reports"; user: AuthUser }) {
  return (
    <div className="mx-auto max-w-4xl">
      <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">پنل بیمار</span>
      <h1 className="mt-3 text-3xl font-black text-slate-950">{mode === "record" ? "پرونده شخصی من" : "گزارش‌های درمانی من"}</h1>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
          <div><p className="text-xl font-black text-slate-950">{user.name}</p><p className="mt-1 text-sm text-slate-500">{user.email}</p></div>
          <span className="w-fit rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-100">حساب بیمار</span>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600 ring-1 ring-slate-100">
          {mode === "record"
            ? "هنوز پرونده درمانی به حساب شما متصل نشده است. برای مشاهده پرونده شخصی با کلینیک تماس بگیرید."
            : "پس از اتصال پرونده شما توسط کلینیک، گزارش‌های درمانی در این بخش نمایش داده می‌شوند."}
        </div>
      </section>
    </div>
  );
}
