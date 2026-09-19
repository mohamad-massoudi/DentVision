"use client";

import { useState } from "react";
import { patients, type PatientStatus } from "@/lib/mockData";

const statusStyles: Record<PatientStatus, string> = {
  فعال: "bg-sky-50 text-sky-700 ring-sky-100",
  "نیازمند پیگیری": "bg-amber-50 text-amber-700 ring-amber-100",
  "درمان تکمیل‌شده": "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

export default function SummaryView() {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id);
  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
          پرونده بیماران
        </span>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          خلاصه پرونده پزشکی
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          بیمار را از فهرست انتخاب کنید تا خلاصه وضعیت و روند درمان او نمایش داده شود.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between px-2 pb-4">
            <h2 className="font-black text-slate-950">فهرست بیماران</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
              {patients.length} بیمار
            </span>
          </div>

          <div className="space-y-2">
            {patients.map((patient) => {
              const isSelected = patient.id === selectedPatient.id;
              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`w-full rounded-2xl border p-4 text-right transition ${
                    isSelected
                      ? "border-sky-200 bg-sky-50/70 shadow-sm"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-black ${isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {patient.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-black text-slate-900">{patient.name}</p>
                        <span className="shrink-0 text-xs text-slate-400">{patient.age} سال</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">{patient.treatment}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-l from-sky-50 to-white p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-2xl bg-slate-950 text-xl font-black text-white shadow-lg shadow-slate-950/10">
                  {selectedPatient.name.slice(0, 1)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950">{selectedPatient.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedPatient.age} ساله · شماره پرونده {selectedPatient.fileNumber}
                  </p>
                </div>
              </div>
              <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusStyles[selectedPatient.status]}`}>
                {selectedPatient.status}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-xs font-bold text-slate-400">آخرین مراجعه</p>
                <p className="mt-2 text-sm font-black text-slate-900">{selectedPatient.lastVisit}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-xs font-bold text-slate-400">درمان جاری</p>
                <p className="mt-2 text-sm font-black text-slate-900">{selectedPatient.treatment}</p>
              </div>
            </div>

            <div className="mt-7">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
                  <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                    <path d="M5 3.5h10A1.5 1.5 0 0 1 16.5 5v12h-13V5A1.5 1.5 0 0 1 5 3.5ZM7 7h6M7 10h6M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="font-black text-slate-950">Medical Summary</h3>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 p-5 sm:p-6">
                <p className="text-sm leading-8 text-slate-700">{selectedPatient.summary}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                <path d="M10 6.5V10l2.5 1.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              این گزارش با داده‌های نمونه تولید شده است.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
