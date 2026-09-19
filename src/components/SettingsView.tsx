export default function SettingsView() {
  return (
    <div className="mx-auto max-w-3xl">
      <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">تنظیمات</span>
      <h1 className="mt-3 text-3xl font-black text-slate-950">تنظیمات کلینیک</h1>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-5">
          <div><label className="mb-2 block text-sm font-bold text-slate-700">نام مرکز</label><input defaultValue="کلینیک دندان‌پزشکی لبخند" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" /></div>
          <div><label className="mb-2 block text-sm font-bold text-slate-700">آدرس</label><input defaultValue="تهران، شعبه مرکزی" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" /></div>
          <button type="button" className="rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-black text-white hover:bg-sky-600">ذخیره تنظیمات</button>
        </div>
      </section>
    </div>
  );
}
