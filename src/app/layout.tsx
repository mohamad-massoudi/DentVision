import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DentVision | دستیار هوشمند دندان‌پزشکی",
  description: "سامانه تحلیل تصاویر و خلاصه پرونده‌های دندان‌پزشکی",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
