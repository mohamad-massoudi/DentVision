"use client";

import { useState, type FormEvent } from "react";
import type { NewPatientInput } from "@/lib/patientTypes";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (patient: NewPatientInput) => Promise<string | null>;
}

export default function AddPatientModal({ isOpen, onClose, onAdd }: AddPatientModalProps) {
  const [status, setStatus] = useState("معاینه اولیه");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError("");
    const result = await onAdd({
      fullName: String(formData.get("name")),
      age: Number(formData.get("age")),
      phone: String(formData.get("phone")),
      fileNumber: String(formData.get("fileNumber")),
      status,
      medicalHistory: String(formData.get("treatment")),
    });
    setIsSubmitting(false);
    if (result) {
      setError(result);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-patient-title">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 id="add-patient-title" className="text-xl font-black text-slate-950">افزودن بیمار جدید</h2>
            <p className="mt-1 text-sm text-slate-500">اطلاعات اولیه پرونده بیمار را وارد کنید.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="بستن" className="grid size-10 place-items-center rounded-xl bg-slate-100 text-xl text-slate-500 hover:bg-slate-200">×</button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="patient-name" className="mb-2 block text-sm font-bold text-slate-700">نام و نام خانوادگی</label>
            <input id="patient-name" name="name" required placeholder="مثلاً علی محمدی" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          </div>
          <div>
            <label htmlFor="patient-age" className="mb-2 block text-sm font-bold text-slate-700">سن</label>
            <input id="patient-age" name="age" type="number" required min={1} max={120} placeholder="۳۵" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          </div>
          <div>
            <label htmlFor="patient-phone" className="mb-2 block text-sm font-bold text-slate-700">شماره تماس</label>
            <input id="patient-phone" name="phone" required dir="ltr" placeholder="09121234567" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          </div>
          <div>
            <label htmlFor="patient-file" className="mb-2 block text-sm font-bold text-slate-700">شماره پرونده</label>
            <input id="patient-file" name="fileNumber" required dir="ltr" placeholder="DV-1405-105" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          </div>
          <div>
            <label htmlFor="patient-status" className="mb-2 block text-sm font-bold text-slate-700">وضعیت درمانی</label>
            <select id="patient-status" value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100">
              <option value="معاینه اولیه">معاینه اولیه</option>
              <option value="تحت درمان">تحت درمان</option>
              <option value="نیازمند پیگیری">نیازمند پیگیری</option>
              <option value="درمان تکمیل‌شده">درمان تکمیل‌شده</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="patient-treatment" className="mb-2 block text-sm font-bold text-slate-700">شرح وضعیت یا درمان</label>
            <textarea id="patient-treatment" name="treatment" required rows={3} placeholder="شرح کوتاهی از وضعیت فعلی بیمار..." className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100 sm:col-span-2">{error}</p>}
          <div className="flex gap-3 border-t border-slate-100 pt-5 sm:col-span-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-2xl bg-sky-500 px-5 py-3.5 text-sm font-black text-white hover:bg-sky-600 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "در حال ثبت..." : "ثبت بیمار"}</button>
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50">انصراف</button>
          </div>
        </form>
      </div>
    </div>
  );
}
