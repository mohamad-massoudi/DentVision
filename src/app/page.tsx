"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isCameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOn]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOn(false);
  };

  useEffect(() => stopCamera, []);

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      streamRef.current = stream;
      setIsCameraOn(true);
    } catch {
      setError("دسترسی به دوربین فعال نشد. مجوز دوربین مرورگر را بررسی کنید.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-950 via-red-700 to-red-500 px-6">
      <section className="w-full max-w-2xl rounded-3xl border border-white/25 bg-white/95 p-10 text-center shadow-2xl shadow-red-950/30 sm:p-16">
        <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-red-600">
          AI VISION
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          پروژه آماده است
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          برای فعال‌کردن دوربین لپ‌تاپ، دکمهٔ زیر را انتخاب کنید.
        </p>

        {error && <p className="mt-5 text-sm text-red-700">{error}</p>}

        {isCameraOn ? (
          <div className="mt-10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="aspect-video w-full rounded-2xl bg-slate-900 object-cover shadow-lg"
            />
            <button
              type="button"
              onClick={stopCamera}
              className="mt-5 rounded-full border border-red-200 bg-red-50 px-7 py-3 font-bold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              بستن دوربین
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startCamera}
            className="mt-10 rounded-full bg-red-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            vision
          </button>
        )}
      </section>
    </main>
  );
}
