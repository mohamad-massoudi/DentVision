"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { PatientRecord } from "@/lib/patientTypes";

type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<SpeechResult> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};
type RecognitionCtor = new () => Recognition;

export default function SummaryView() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("fa-IR");
  const [voiceText, setVoiceText] = useState("");
  const [voicePatientId, setVoicePatientId] = useState("");
  const [showVoicePreview, setShowVoicePreview] = useState(false);
  const [finishingVoice, setFinishingVoice] = useState(false);
  const liveVoiceText = useRef("");
  const recognition = useRef<Recognition | null>(null);
  useEffect(() => {
    void fetch("/api/patients", { cache: "no-store" }).then(r => r.json()).then(d => setPatients(d.patients ?? [])).catch(() => setMessage("دریافت پرونده‌ها ناموفق بود."));
    return () => recognition.current?.stop();
  }, []);
  const selected = patients.find(p => p.id === selectedId) ?? patients[0];
  const selectPatient = (patient: PatientRecord) => {
    if (listening || finishingVoice || saving) return;
    recognition.current?.stop();
    setVoiceText("");
    setShowVoicePreview(false);
    setSelectedId(patient.id);
    setDraft(patient.reports?.[0]?.content ?? patient.medicalHistory ?? "");
    setMessage("");
  };
  const startListening = () => {
    if (!selected || listening || finishingVoice || saving || recognition.current) return;
    const browser = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const Ctor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Ctor) { setMessage("مرورگر شما از تبدیل گفتار به متن پشتیبانی نمی‌کند."); return; }
    const instance = new Ctor();
    recognition.current = instance;
    setVoicePatientId(selected.id);
    const segmentsByIndex = new Map<number, string>();
    const existingVoiceText = voiceText.trim();
    liveVoiceText.current = existingVoiceText;
    setShowVoicePreview(true);
    instance.lang = language;
    instance.continuous = true;
    instance.interimResults = true;
    instance.onresult = event => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        segmentsByIndex.set(i, event.results[i][0].transcript.trim());
      }
      const addition = Array.from(segmentsByIndex.entries()).sort(([first], [second]) => first - second).map(([, text]) => text).filter(Boolean).join(" ");
      liveVoiceText.current = [existingVoiceText, addition].filter(Boolean).join(" ");
      setVoiceText(liveVoiceText.current);
    };
    instance.onerror = event => {
      const errors: Record<string, string> = {
        "not-allowed": "دسترسی میکروفون رد شد؛ دسترسی میکروفون سایت را فعال کنید.",
        "audio-capture": "میکروفون در دسترس نیست.",
        "network": "سرویس تشخیص گفتار مرورگر در دسترس نیست؛ اتصال اینترنت را بررسی کنید.",
        "no-speech": "گفتاری تشخیص داده نشد؛ دوباره ضبط کنید.",
        "language-not-supported": "زبان انتخاب‌شده توسط سرویس مرورگر پشتیبانی نمی‌شود.",
      };
      setMessage(errors[event.error] ?? `خطای دریافت صدا: ${event.error}`);
    };
    instance.onend = () => {
      setVoiceText(liveVoiceText.current);
      setListening(false);
      setFinishingVoice(false);
      recognition.current = null;
    };
    try { instance.start(); setListening(true); setMessage(""); }
    catch { recognition.current = null; setListening(false); setMessage("میکروفون فعال نشد. دسترسی مرورگر را بررسی کنید."); }
  };
  const stopListening = () => {
    setVoiceText(liveVoiceText.current);
    setShowVoicePreview(true);
    setFinishingVoice(true);
    try { recognition.current?.stop(); }
    catch { setListening(false); setFinishingVoice(false); recognition.current = null; }
  };
  const confirmVoice = () => {
    if (listening || finishingVoice || voicePatientId !== selected?.id || !voiceText.trim()) return;
    setDraft(current => [current.trim(), voiceText.trim()].filter(Boolean).join("\n"));
    setVoiceText("");
    setShowVoicePreview(false);
    setMessage("متن صوت تأیید و به گزارش اضافه شد؛ برای ثبت در پرونده، ذخیره گزارش را بزنید.");
  };
  const save = async () => {
    if (!selected || !draft.trim() || saving || listening || voiceText.trim()) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/patients/${selected.id}/reports`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "ذخیره گزارش ناموفق بود.");
      setPatients(current => current.map(patient => patient.id === selected.id ? { ...patient, medicalHistory: data.report.content, reports: [data.report, ...(patient.reports ?? [])] } : patient));
      setMessage("گزارش در پرونده بیمار ذخیره شد.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "ذخیره گزارش ناموفق بود."); }
    finally { setSaving(false); }
  };
  return <div className="mx-auto max-w-6xl">
    <h1 className="text-3xl font-black">خلاصه پرونده و گزارش درمان</h1>
    <p className="mt-2 text-sm text-slate-500">گزارش پزشک با نام و تاریخ در پرونده بیمار ثبت می‌شود.</p>
    <div className="mt-8 grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="rounded-3xl border border-slate-200 bg-white p-4">
        {patients.map(patient => <button key={patient.id} type="button" disabled={listening || saving} onClick={() => selectPatient(patient)} className={`mb-2 w-full rounded-2xl p-4 text-right ${selected?.id === patient.id ? "bg-sky-50 text-sky-700" : "hover:bg-slate-50"}`}>
          <b>{patient.fullName}</b><small className="mt-1 block">{patient.fileNumber}</small>
        </button>)}
        {!patients.length && <p className="p-5 text-sm text-slate-400">بیماری ثبت نشده است.</p>}
      </aside>
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        {selected ? <>
          <h2 className="text-xl font-black">{selected.fullName}</h2>
          <p className="mt-1 text-sm text-slate-500">پرونده {selected.fileNumber} · {selected.status}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">{selected.images?.map(image => <img key={image.id} src={image.url} alt={image.fileName} className="max-h-52 w-full rounded-2xl bg-slate-950 object-contain" />)}</div>
          <label className="mt-6 block text-sm font-bold">گزارش درمانی
            <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={8} className="field mt-2 resize-y" placeholder="شرح معاینه، تشخیص، درمان و توصیه‌های پزشک..." />
          </label>
          <div className="mt-3 flex flex-wrap gap-3">
            <select value={language} disabled={listening} onChange={event => setLanguage(event.target.value)} aria-label="زبان گفتار" className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="fa-IR">فارسی</option><option value="en-US">English</option></select>
            <button type="button" disabled={finishingVoice || saving} onClick={() => listening ? stopListening() : startListening()} className="rounded-xl border border-sky-200 px-4 py-2 text-sm font-bold text-sky-700 disabled:opacity-50">{finishingVoice ? "در حال نهایی‌کردن متن..." : listening ? "توقف ضبط" : "🎙 تبدیل گفتار به متن"}</button>
            <button type="button" disabled={saving || listening || Boolean(voiceText.trim()) || !draft.trim()} onClick={() => void save()} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : "ذخیره گزارش"}</button>
          </div>
          {showVoicePreview && <section className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <label className="block text-sm font-bold">پیش‌نمایش متن صوت؛ پس از توقف بازبینی و تأیید کنید
              <textarea dir={language === "fa-IR" ? "rtl" : "ltr"} value={voiceText} disabled={listening || finishingVoice} onChange={event => setVoiceText(event.target.value)} rows={4} className="field mt-2" placeholder={listening ? "در حال دریافت گفتار..." : "متنی تشخیص داده نشد؛ دسترسی میکروفون و اتصال اینترنت را بررسی کنید."} />
            </label>
            <div className="mt-3 flex gap-3">
              <button type="button" disabled={listening || !voiceText.trim()} onClick={confirmVoice} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">تأیید و افزودن به گزارش</button>
              <button type="button" disabled={listening || finishingVoice} onClick={() => { setVoiceText(""); setShowVoicePreview(false); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">لغو متن صوت</button>
            </div>
          </section>}
          <p className="mt-3 text-xs text-slate-500">برای اصطلاحات پزشکی و گفتار ترکیبی فارسی و انگلیسی، متن تبدیل‌شده را پیش از ذخیره بررسی کنید. دقت به مرورگر، کیفیت صدا و زبان انتخاب‌شده بستگی دارد.</p>
          <div className="mt-6 space-y-3 border-t pt-5"><h3 className="font-black">گزارش‌های قبلی</h3>
            {selected.reports?.map(report => <article key={report.id} className="rounded-2xl bg-slate-50 p-4 text-sm"><p className="whitespace-pre-wrap">{report.content}</p><small className="mt-2 block text-slate-500">{report.author.name} · {new Date(report.createdAt).toLocaleString("fa-IR")}</small></article>)}
          </div>
        </> : <p className="text-slate-400">برای مشاهده گزارش، بیمار را انتخاب کنید.</p>}
      </section>
    </div>
    {message && <p role="status" className="mt-5 rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}
  </div>;
}
