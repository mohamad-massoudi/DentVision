import type { ReactNode } from "react";

export type DashboardView = "analysis" | "summary";

interface LayoutProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  children: ReactNode;
}

const navItems: Array<{
  id: DashboardView;
  label: string;
  description: string;
}> = [
  { id: "analysis", label: "تحلیل تصویر", description: "بررسی تصاویر دندان" },
  { id: "summary", label: "خلاصه پرونده", description: "سوابق و گزارش بیماران" },
];

function NavIcon({ type }: { type: DashboardView }) {
  return type === "analysis" ? (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v9a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m7.5 16 3-3 2.2 2.2 1.8-1.7 2 2M15.8 9.2h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path d="M7 4.5h10A2.5 2.5 0 0 1 19.5 7v12.5h-15V7A2.5 2.5 0 0 1 7 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 4.5V3h6v1.5M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Layout({ activeView, onViewChange, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-72 flex-col border-l border-slate-200 bg-white px-5 py-7 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-11 place-items-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
              <path d="M8.2 3.5c1.2 0 2.3.6 3.8.6s2.6-.6 3.8-.6c2.6 0 4.2 2.1 4.2 4.7 0 2.1-.8 3.5-1.5 5-.8 1.7-1.1 3.2-1.5 5.1-.3 1.4-.8 2.2-1.7 2.2-1.2 0-1.4-1.8-1.8-3.4-.3-1.2-.7-2.1-1.5-2.1s-1.2.9-1.5 2.1c-.4 1.6-.6 3.4-1.8 3.4-.9 0-1.4-.8-1.7-2.2-.4-1.9-.7-3.4-1.5-5.1-.7-1.5-1.5-2.9-1.5-5 0-2.6 1.6-4.7 4.2-4.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">DentVision</p>
            <p className="mt-0.5 text-xs text-slate-500">دستیار هوشمند دندان‌پزشکی</p>
          </div>
        </div>

        <nav className="mt-12 space-y-2" aria-label="ناوبری اصلی">
          <p className="mb-3 px-3 text-xs font-bold text-slate-400">منوی اصلی</p>
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-right transition ${
                  isActive
                    ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <span className={isActive ? "text-sky-500" : "text-slate-400"}>
                  <NavIcon type={item.id} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className="mt-1 block text-xs font-normal text-slate-400">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-slate-950 p-4 text-white">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="size-2 rounded-full bg-emerald-400" />
            سیستم آماده است
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            نسخه نمایشی MVP — داده‌ها به‌صورت محلی نمایش داده می‌شوند.
          </p>
        </div>
      </aside>

      <div className="lg:pr-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <div>
              <p className="text-sm font-black text-slate-900 sm:text-base">کلینیک دندان‌پزشکی لبخند</p>
              <p className="mt-1 text-xs text-slate-500">تهران، شعبه مرکزی</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                اتصال پایدار
              </div>
              <div className="grid size-10 place-items-center rounded-full bg-slate-900 text-sm font-black text-white">
                د‌ل
              </div>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-5 pb-3 lg:hidden" aria-label="ناوبری موبایل">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition ${
                  activeView === item.id
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
