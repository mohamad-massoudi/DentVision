"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  analyzeDentalImage,
  type AnalysisResult,
} from "@/lib/mockData";
import type { PatientRecord } from "@/lib/patientTypes";

export default function AnalysisView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [patientId, setPatientId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/patients", { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { patients?: PatientRecord[] }) => setPatients(data.patients ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const setImage = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImage(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setImage(event.dataTransfer.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!imageFile || !patients.length) return;
    setIsAnalyzing(true);
    setResult(null);
    const response = await analyzeDentalImage(patientId, imageFile);
    setResult(response);
    setIsAnalyzing(false);
  };

  const selectedPatient = patients.find((patient) => patient.id === patientId) ?? patients[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
            تحلیل هوشمند
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            تحلیل تصویر دندان
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            بیمار را انتخاب و تصویر دندان را بارگذاری کنید تا نتیجهٔ اولیه نمایش داده شود.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
          <span className="font-bold text-slate-900">یادآوری:</span> خروجی نسخه MVP آزمایشی است.
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <label htmlFor="patient" className="mb-2 block text-sm font-bold text-slate-800">
              انتخاب بیمار
            </label>
            <div className="relative">
              <select
                id="patient"
                value={selectedPatient?.id ?? ""}
                onChange={(event) => {
                  setPatientId(event.target.value);
                  setResult(null);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName} — {patient.fileNumber}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
                <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              وضعیت: {selectedPatient?.status ?? "هنوز بیماری ثبت نشده است"}
            </p>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition ${
              isDragging
                ? "border-sky-400 bg-sky-50"
                : imageFile
                  ? "border-slate-200 bg-slate-950"
                  : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/40"
            }`}
          >
            {previewUrl ? (
              <div className="relative aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="تصویر دندان بارگذاری‌شده" className="size-full object-contain" />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="absolute left-4 top-4 rounded-xl bg-white/90 px-3 py-2 text-xs font-bold text-slate-800 shadow-lg backdrop-blur hover:bg-white"
                >
                  تغییر تصویر
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex min-h-72 w-full flex-col items-center justify-center p-8 text-center"
              >
                <span className="grid size-16 place-items-center rounded-2xl bg-white text-sky-500 shadow-sm ring-1 ring-slate-200">
                  <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
                    <path d="M12 16V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mt-5 text-base font-black text-slate-900">تصویر را اینجا رها کنید</span>
                <span className="mt-2 text-sm text-slate-500">یا برای انتخاب فایل کلیک کنید</span>
                <span className="mt-4 text-xs text-slate-400">JPG، PNG یا WEBP تا حجم ۱۰ مگابایت</span>
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!imageFile || isAnalyzing || !patients.length}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {isAnalyzing ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                در حال تحلیل تصویر...
              </>
            ) : (
              "شروع تحلیل"
            )}
          </button>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">نتیجه تحلیل</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Mock AI</span>
          </div>

          {result ? (
            <div className="mt-6">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-sky-500 text-white">
                    <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
                      <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-black text-slate-950">{result.title}</p>
                    <p className="mt-1 text-xs font-bold text-sky-700">اطمینان مدل: {result.confidence}٪</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-black text-slate-400">یافته اولیه</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{result.description}</p>
                </div>
                <div className="h-px bg-slate-100" />
                <div>
                  <p className="text-xs font-black text-slate-400">پیشنهاد بررسی</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{result.recommendation}</p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-amber-50 p-4 text-xs leading-6 text-amber-800 ring-1 ring-amber-100">
                این نتیجه صرفاً برای نمایش عملکرد نسخه اولیه است و تشخیص پزشکی محسوب نمی‌شود.
              </div>
            </div>
          ) : (
            <div className="flex min-h-96 flex-col items-center justify-center text-center">
              <div className="grid size-16 place-items-center rounded-full bg-slate-50 text-slate-300 ring-1 ring-slate-100">
                <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="mt-5 font-bold text-slate-700">هنوز تحلیلی انجام نشده</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                پس از انتخاب تصویر و شروع تحلیل، گزارش اولیه در این بخش نمایش داده می‌شود.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
