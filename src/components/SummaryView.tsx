"use client";

import { useEffect, useState } from "react";
import type { PatientRecord } from "@/lib/patientTypes";

export default function SummaryView() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/patients", { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as { patients?: PatientRecord[]; message?: string };
        if (!response.ok) throw new Error(data.message);
        setPatients(data.patients ?? []);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError") setError(reason.message);
      });
    return () => controller.abort();
  }, []);

  const selected = patients.find((patient) => patient.id === selectedId) ?? patients[0];

  return (
    <div className="mx-auto max-w-6xl">
      <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">پرونده بیماران</span>
      <h1 className="mt-3 text-3xl font-black text-slate-950">خلاصه پرونده پزشکی</h1>
      <p className="mt-2 text-sm text-slate-500">بیمار را انتخاب کنید تا اطلاعات ثبت‌شده در دیتابیس نمایش داده شود.</p>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="mt-8 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4"><h2 className="font-black">فهرست بیماران</h2><span className="text-xs text-slate-500">{patients.length} بیمار</span></div>
          {patients.map((patient) => (
            <button key={patient.id} type="button" onClick={() => setSelectedId(patient.id)} className={`mb-2 w-full rounded-2xl border p-4 text-right transition ${selected?.id === patient.id ? "border-sky-200 bg-sky-50" : "border-transparent hover:bg-slate-50"}`}>
              <p className="font-black text-slate-900">{patient.fullName}</p><p className="mt-1 text-xs text-slate-500">{patient.fileNumber} · {patient.status}</p>
            </button>
          ))}
          {!selected && <p className="py-10 text-center text-sm text-slate-400">هنوز بیماری ثبت نشده است.</p>}
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-6"><div><h2 className="text-xl font-black">{selected.fullName}</h2><p className="mt-1 text-sm text-slate-500">{selected.age} ساله · پرونده {selected.fileNumber}</p></div><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">{selected.status}</span></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">تاریخ ثبت</p><p className="mt-2 text-sm font-bold">{new Date(selected.createdAt).toLocaleDateString("fa-IR")}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">شماره تماس</p><p className="mt-2 text-sm font-bold">{selected.phone}</p></div></div>
              <h3 className="mt-8 font-black">سابقه پزشکی / Medical Summary</h3><p className="mt-3 rounded-2xl border border-slate-200 p-5 text-sm leading-8 text-slate-700">{selected.medicalHistory || "هنوز سابقه پزشکی ثبت نشده است."}</p>
            </>
          ) : <div className="grid min-h-72 place-items-center text-sm text-slate-400">پرونده‌ای برای نمایش وجود ندارد.</div>}
        </section>
      </div>
    </div>
  );
}
