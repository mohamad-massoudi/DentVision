import Link from "next/link";
import type { ReactNode } from "react";
import { roleLabels, type AuthUser, type Role } from "@/lib/auth";

export type DashboardView =
  | "analysis"
  | "patients"
  | "records"
  | "upload"
  | "my-record"
  | "reports"
  | "settings";

interface NavItem {
  id: DashboardView;
  label: string;
  description: string;
}

const roleNavigation: Record<Role, NavItem[]> = {
  dentist: [
    { id: "analysis", label: "تحلیل تصویر", description: "پنل هوش مصنوعی" },
    { id: "patients", label: "مدیریت بیماران", description: "افزودن و ویرایش بیمار" },
    { id: "records", label: "خلاصه پرونده", description: "سوابق و گزارش‌ها" },
    { id: "settings", label: "تنظیمات", description: "تنظیمات کلینیک" },
  ],
  staff: [
    { id: "patients", label: "مدیریت بیماران", description: "پرونده‌های کلینیک" },
    { id: "upload", label: "آپلود پرونده", description: "ثبت تصویر و مدرک" },
  ],
  patient: [
    { id: "my-record", label: "پرونده من", description: "اطلاعات درمانی شخصی" },
    { id: "reports", label: "گزارش‌های من", description: "خلاصه و سوابق درمان" },
  ],
};

interface LayoutProps {
  user: AuthUser;
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onLogout: () => void;
  children: ReactNode;
}

function Logo() {
  return (
    <div className="grid size-11 place-items-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
      <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
        <path d="M8.2 3.5c1.2 0 2.3.6 3.8.6s2.6-.6 3.8-.6c2.6 0 4.2 2.1 4.2 4.7 0 2.1-.8 3.5-1.5 5-.8 1.7-1.1 3.2-1.5 5.1-.3 1.4-.8 2.2-1.7 2.2-1.2 0-1.4-1.8-1.8-3.4-.3-1.2-.7-2.1-1.5-2.1s-1.2.9-1.5 2.1c-.4 1.6-.6 3.4-1.8 3.4-.9 0-1.4-.8-1.7-2.2-.4-1.9-.7-3.4-1.5-5.1-.7-1.5-1.5-2.9-1.5-5 0-2.6 1.6-4.7 4.2-4.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function Layout({ user, activeView, onViewChange, onLogout, children }: LayoutProps) {
  const navItems = roleNavigation[user.role];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-72 flex-col border-l border-slate-200 bg-white px-5 py-7 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <Logo />
          <div><p className="text-xl font-black tracking-tight">DentVision</p><p className="mt-0.5 text-xs text-slate-500">دستیار هوشمند دندان‌پزشکی</p></div>
        </div>

        <nav className="mt-10 space-y-2" aria-label="ناوبری اصلی">
          <p className="mb-3 px-3 text-xs font-bold text-slate-400">منوی {roleLabels[user.role]}</p>
          {navItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button key={item.id} type="button" onClick={() => onViewChange(item.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-right transition ${active ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-xl text-xs font-black ${active ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"}`}>{item.label.slice(0, 1)}</span>
                <span><span className="block text-sm font-bold">{item.label}</span><span className="mt-1 block text-xs font-normal text-slate-400">{item.description}</span></span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <Link href="/profile" className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 transition hover:bg-slate-50">
            <span className="grid size-10 place-items-center rounded-full bg-slate-950 font-black text-white">{user.name.slice(0, 1)}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-black text-slate-900">{user.name}</span><span className="mt-1 block text-xs text-slate-400">مشاهده پروفایل</span></span>
          </Link>
          <button type="button" onClick={onLogout} className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600">خروج از حساب</button>
        </div>
      </aside>

      <div className="lg:pr-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <div><p className="text-sm font-black text-slate-900 sm:text-base">کلینیک دندان‌پزشکی لبخند</p><p className="mt-1 text-xs text-slate-500">تهران، شعبه مرکزی</p></div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex"><span className="size-2 rounded-full bg-emerald-500" />اتصال پایدار</div>
              <Link href="/profile" className="flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-3 pr-1.5 hover:bg-slate-200"><span className="grid size-8 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{user.name.slice(0, 1)}</span><span className="hidden text-xs font-bold text-slate-700 sm:block">{roleLabels[user.role]}</span></Link>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-5 pb-3 lg:hidden" aria-label="ناوبری موبایل">
            {navItems.map((item) => <button key={item.id} type="button" onClick={() => onViewChange(item.id)} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold ${activeView === item.id ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600"}`}>{item.label}</button>)}
            <Link href="/profile" className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">پروفایل</Link>
          </nav>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
