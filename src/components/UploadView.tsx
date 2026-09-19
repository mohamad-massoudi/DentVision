"use client";

import { useState, type ChangeEvent } from "react";
import { patients } from "@/lib/mockData";

export default function UploadView() {
  const [fileName, setFileName] = useState("");
  const [saved, setSaved] = useState(false);
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.files?.[0]?.name ?? "");
    setSaved(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">آپلود پرونده</span>
      <h1 className="mt-3 text-3xl font-black text-slate-950">افزودن تصویر به پرونده بیمار</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">این بخش فقط تصویر را به پرونده متصل می‌کند و تحلیل هوش مصنوعی انجام نمی‌دهد.</p>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <label className="mb-2 block text-sm font-bold text-slate-700">انتخاب بیمار</label>
        <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
          {patients.map((patient) => <option key={patient.id}>{patient.name} — {patient.fileNumber}</option>)}
        </select>
        <label className="mt-6 flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center hover:border-sky-300 hover:bg-sky-50/40">
          <span className="grid size-14 place-items-center rounded-2xl bg-white text-2xl text-sky-500 shadow-sm">↑</span>
          <span className="mt-4 font-black text-slate-900">انتخاب تصویر یا فایل پرونده</span>
          <span className="mt-2 text-sm text-slate-500">{fileName || "برای انتخاب فایل کلیک کنید"}</span>
          <input type="file" accept="image/*,.pdf" onChange={handleFile} className="sr-only" />
        </label>
        <button type="button" disabled={!fileName} onClick={() => setSaved(true)} className="mt-5 w-full rounded-2xl bg-sky-500 px-5 py-4 text-sm font-black text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">ثبت در پرونده</button>
        {saved && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-100">فایل در نسخه Mock با موفقیت ثبت شد.</p>}
      </section>
    </div>
  );
}
