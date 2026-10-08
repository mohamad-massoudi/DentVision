"use client";

import { useEffect, useState } from "react";
import type { NewPatientInput, PatientRecord } from "@/lib/patientTypes";
import AddPatientModal from "./AddPatientModal";
import EditPatientModal from "./EditPatientModal";

export default function PatientsView() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<PatientRecord | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      fetch(`/api/patients?search=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(async (response) => {
          const data = (await response.json()) as { patients?: PatientRecord[]; message?: string };
          if (!response.ok) throw new Error(data.message);
          setPatients(data.patients ?? []);
          setError("");
        })
        .catch((fetchError: unknown) => {
          if (fetchError instanceof Error && fetchError.name !== "AbortError") setError(fetchError.message);
        })
        .finally(() => setIsLoading(false));
    }, 250);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const addPatient = async (input: NewPatientInput) => {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await response.json()) as { patient?: PatientRecord; message?: string };
    if (!response.ok || !data.patient) return data.message ?? "ثبت بیمار انجام نشد.";
    setPatients((current) => [data.patient!, ...current]);
    return null;
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">مدیریت بیماران</span>
          <h1 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">بیماران کلینیک</h1>
          <p className="mt-2 text-sm text-slate-500">اطلاعات بیماران و وضعیت پرونده‌های درمانی را مدیریت کنید.</p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className="rounded-2xl bg-sky-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-sky-500/20 hover:bg-sky-600">+ افزودن بیمار جدید</button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-black text-slate-950">فهرست بیماران</h2>
            <p className="mt-1 text-xs text-slate-400">{isLoading ? "در حال دریافت اطلاعات..." : `${patients.length} پرونده ثبت‌شده`}</p>
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی نام، شماره تماس یا پرونده..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 sm:max-w-sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead><tr className="border-y border-slate-100 text-xs text-slate-400"><th className="px-3 py-4 font-bold">بیمار</th><th className="px-3 py-4 font-bold">شماره پرونده</th><th className="px-3 py-4 font-bold">تماس</th><th className="px-3 py-4 font-bold">درمان فعلی</th><th className="px-3 py-4 font-bold">وضعیت</th><th className="px-3 py-4 font-bold">عملیات</th></tr></thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                  <td className="px-3 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-sky-50 font-black text-sky-700">{patient.fullName.slice(0, 1)}</span><div><p className="font-black text-slate-900">{patient.fullName}</p><p className="mt-1 text-xs text-slate-400">{patient.age} سال</p></div></div></td>
                  <td className="px-3 py-4 font-medium text-slate-600">{patient.fileNumber}</td>
                  <td className="px-3 py-4 text-slate-600" dir="ltr">{patient.phone}</td>
                  <td className="max-w-56 truncate px-3 py-4 text-slate-600">{patient.medicalHistory || "ثبت نشده"}</td>
                  <td className="px-3 py-4"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{patient.status}</span></td>
                  <td className="px-3 py-4"><button type="button" onClick={() => setEditing(patient)} className="rounded-xl bg-sky-50 px-3 py-2 font-bold text-sky-700">ویرایش پرونده</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}
      </section>

      <AddPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addPatient} />
      {editing && <EditPatientModal key={editing.id} patient={editing} onClose={() => setEditing(null)} onSaved={updated => setPatients(current => current.map(patient => patient.id === updated.id ? updated : patient))} />}
    </div>
  );
}
