"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PrintableReport } from "@/lib/printTypes";

function dateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(value));
}

export function ReportSheet({ data, selectedImages, captions }: { data: PrintableReport; selectedImages: string[]; captions: Record<string, string> }) {
  const { clinic, patient, report } = data;
  const fields = [["نام بیمار", patient.fullName], ["سن", `${patient.age} سال`], ["شماره پرونده", patient.fileNumber], ["کد ملی", patient.nationalId], ["شماره تماس", patient.phone], ["وضعیت درمان", patient.status], ["پزشک معالج", report.author.name], ["تماس پزشک", report.author.phone || "ثبت نشده"]];
  return <article className="medical-report-sheet" dir="rtl">
    <header className="report-letterhead">
      <div className="flex items-center gap-4">
        <div className="report-mark" aria-label="نشان عمومی کلینیک"><svg viewBox="0 0 24 24" fill="none" width="36" height="36" aria-hidden="true"><path d="M8 4c2 0 2.5 1 4 1s2-1 4-1c3 0 4 3 3 6-1 3-2 4-2.5 8-.5 3-2 3-2.5 0-.5-2-1-3-2-3s-1.5 1-2 3c-.5 3-2 3-2.5 0C7 14 6 13 5 10 4 7 5 4 8 4Z" stroke="currentColor" strokeWidth="1.7" /></svg></div>
        <div><h1 className="text-xl font-black">{clinic.name}</h1><p className="mt-1 text-sm">گزارش رسمی درمان دندان‌پزشکی</p></div>
      </div>
      <div className="mt-4 text-xs leading-6"><p>{clinic.address}</p><p>تلفن مطب: <bdi>{clinic.phone}</bdi></p></div>
      <div className="mt-4 grid gap-1 text-xs"><p>تاریخ ثبت گزارش: {dateTime(report.createdAt, "fa-IR")}</p><p dir="ltr" className="text-left">{dateTime(report.createdAt, "en-GB-u-ca-gregory")} (Tehran)</p><p>شناسه گزارش: <bdi>{report.id}</bdi></p></div>
    </header>
    <section className="mt-6"><h2 className="report-section-title">مشخصات بالینی و پرونده</h2>
      <table className="report-details"><tbody>{[0, 2, 4, 6].map(index => <tr key={index}><th scope="row">{fields[index][0]}</th><td><bdi>{fields[index][1]}</bdi></td><th scope="row">{fields[index + 1][0]}</th><td><bdi>{fields[index + 1][1]}</bdi></td></tr>)}</tbody></table>
    </section>
    <section className="mt-6"><h2 className="report-section-title">شرح گزارش پزشک</h2><div dir="auto" style={{ unicodeBidi: "plaintext", textAlign: "start" }} className="report-body whitespace-pre-wrap">{report.content}</div></section>
    {data.images.some(image => selectedImages.includes(image.id)) && <section className="mt-6"><h2 className="report-section-title">تصاویر رادیولوژی منتخب پرونده</h2>
      <div className="report-images">{data.images.filter(image => selectedImages.includes(image.id)).map(image => <figure key={image.id}><img src={image.url} alt={image.fileName} /><figcaption dir="auto" style={{ unicodeBidi: "plaintext", textAlign: "start" }}>{captions[image.id]?.trim() || image.fileName}<small className="mt-1 block">تاریخ آپلود: {dateTime(image.uploadedAt, "fa-IR")}</small></figcaption></figure>)}</div>
    </section>}
    <footer className="report-signature"><p className="font-bold">امضا و مهر پزشک معالج: {report.author.name}</p><div className="mt-5 h-20 border-b border-dashed border-slate-300" /><p className="mt-3 text-xs text-slate-500">این نسخه از گزارش ذخیره‌شده تهیه شده است؛ محل امضا و مهر برای تأیید پزشک است و امضای دیجیتال محسوب نمی‌شود.</p></footer>
  </article>;
}

export default function MedicalReportPrint({ patientId, reportId }: { patientId: string; reportId: string }) {
  const [data, setData] = useState<PrintableReport | null>(null);
  const [error, setError] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [printing, setPrinting] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/patients/${encodeURIComponent(patientId)}/reports/${encodeURIComponent(reportId)}/print`, { cache: "no-store", signal: controller.signal })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.message ?? "دریافت گزارش ناموفق بود."); setData(result); setSelectedImages(result.images.map((image: { id: string }) => image.id)); })
      .catch(cause => { if (cause.name !== "AbortError") setError(cause.message ?? "ارتباط با سرور برقرار نشد."); });
    return () => controller.abort();
  }, [patientId, reportId]);
  const print = async () => {
    if (!data || printing) return;
    setPrinting(true); setError("");
    try {
      await document.fonts.ready;
      const images = Array.from(sheet.current?.querySelectorAll("img") ?? []);
      await Promise.all(images.map(image => image.decode()));
      if (images.some(image => !image.naturalWidth)) throw new Error("image");
      document.title = `گزارش درمان - ${data.patient.fileNumber}`;
      window.print();
    } catch { setError("بارگذاری تصاویر کامل نشد؛ دوباره تلاش کنید یا تصویر مشکل‌دار را از چاپ حذف کنید."); }
    finally { setPrinting(false); }
  };
  return <main className="report-print-page min-h-screen bg-slate-100 px-3 py-6 sm:px-6">
    <div className="print:hidden mx-auto mb-6 max-w-4xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/" className="font-bold text-sky-700">بازگشت به داشبورد</Link><button type="button" disabled={!data || printing} onClick={() => void print()} className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-white disabled:opacity-50">{printing ? "آماده‌سازی تصاویر..." : "چاپ / دریافت PDF گزارش"}</button></div>
      <p className="text-sm text-slate-500">برای دریافت PDF، در پنجره چاپ مقصد «Save as PDF» را انتخاب کنید. اندازه کاغذ A4 و سربرگ/پابرگ مرورگر غیرفعال باشد.</p>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!data && !error && <p>در حال دریافت گزارش...</p>}
      {data && data.images.length > 0 && <fieldset disabled={printing} className="space-y-3"><legend className="mb-3 font-bold">انتخاب تصاویر و توضیحات چاپ</legend><p className="text-xs text-slate-500">توضیحات زیر فقط در این خروجی چاپ استفاده می‌شوند و پرونده را تغییر نمی‌دهند.</p>{data.images.map(image => <div key={image.id} className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2"><input type="checkbox" checked={selectedImages.includes(image.id)} onChange={event => setSelectedImages(current => event.target.checked ? [...current, image.id] : current.filter(id => id !== image.id))} /><bdi className="max-w-60 break-all text-sm">{image.fileName}</bdi></label><input aria-label={`توضیح تصویر ${image.fileName}`} maxLength={500} value={captions[image.id] ?? ""} onChange={event => setCaptions(current => ({ ...current, [image.id]: event.target.value }))} placeholder="توضیح تصویر (اختیاری)" className="field flex-1" /></div>)}</fieldset>}
    </div>
    <div ref={sheet}>{data && <ReportSheet data={data} selectedImages={selectedImages} captions={captions} />}</div>
  </main>;
}
