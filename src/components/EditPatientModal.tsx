"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PatientRecord } from "@/lib/patientTypes";

export default function EditPatientModal({ patient, onClose, onSaved }: {
  patient: PatientRecord; onClose: () => void; onSaved: (patient: PatientRecord) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/patients/${encodeURIComponent(patient.id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: data.get("fullName"), age: Number(data.get("age")), phone: data.get("phone"), status: data.get("status"), medicalHistory: data.get("medicalHistory") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "ویرایش پرونده ناموفق بود.");
      onSaved(result.patient); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "ارتباط با سرور برقرار نشد."); }
    finally { setSaving(false); }
  };
  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); if (!saving) onClose(); }} className="m-auto max-h-[90vh] w-[min(95vw,36rem)] rounded-3xl border-0 bg-white p-6 text-slate-950 shadow-xl backdrop:bg-slate-950/45" aria-labelledby="edit-patient-title">
    <form onSubmit={event => void submit(event)}>
      <div className="flex items-center justify-between"><h2 id="edit-patient-title" className="text-xl font-black">ویرایش پرونده بیمار</h2><button type="button" disabled={saving} onClick={onClose} aria-label="بستن" className="rounded-xl bg-slate-100 px-3 py-2">×</button></div>
      <p className="mt-2 text-sm text-slate-500">شماره پرونده: {patient.fileNumber} · کد ملی: {patient.nationalId}</p>
      <fieldset disabled={saving} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">نام کامل<input name="fullName" defaultValue={patient.fullName} required maxLength={150} className="field mt-1" /></label>
        <label>سن<input name="age" type="number" defaultValue={patient.age} required min={1} max={120} className="field mt-1" /></label>
        <label>شماره تماس<input name="phone" dir="ltr" defaultValue={patient.phone} required minLength={7} maxLength={20} className="field mt-1" /></label>
        <label className="sm:col-span-2">وضعیت درمان<input name="status" defaultValue={patient.status} list="treatment-statuses" required maxLength={100} className="field mt-1" /><datalist id="treatment-statuses"><option>معاینه اولیه</option><option>تحت درمان</option><option>نیازمند پیگیری</option><option>درمان تکمیل‌شده</option></datalist></label>
        <label className="sm:col-span-2">سابقه پزشکی<textarea name="medicalHistory" dir="auto" style={{ unicodeBidi: "plaintext", textAlign: "start" }} defaultValue={patient.medicalHistory ?? ""} maxLength={50000} rows={5} className="field mt-1 resize-y" /></label>
      </fieldset>
      <p className="mt-3 text-xs text-slate-500">ویرایش سابقه، گزارش‌های ثبت‌شده پزشک را تغییر نمی‌دهد.</p>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 flex gap-3"><button disabled={saving} className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</button><button type="button" disabled={saving} onClick={onClose} className="rounded-xl border px-5 py-3">انصراف</button></div>
    </form>
  </dialog>;
}
