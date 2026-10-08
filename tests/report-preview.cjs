/* eslint-disable @typescript-eslint/no-require-imports */
// Read-only visual fixture. No database access, no session bypass, no real patient data.
const http = require("node:http");
const fs = require("node:fs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");
const load = require("./load-typescript.cjs");
const { ReportSheet } = load("src/components/MedicalReportPrint.tsx");

async function main() {
  const stylesheet = fs.readFileSync("src/app/globals.css", "utf8");
  const css = (await postcss([tailwind()]).process(stylesheet, { from: "src/app/globals.css" })).css;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="600" height="300" fill="#0f172a"/><text x="300" y="160" fill="#cbd5e1" text-anchor="middle" font-size="30">Sample image — not an X-ray</text></svg>`;
  const image = { id: "i1", url: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, fileName: "sample-image", uploadedAt: "2026-10-07T10:00:00Z" };
  const data = {
    clinic: { name: "کلینیک نمونه — داده آزمایشی", address: "نشانی نمونه برای بررسی چاپ", phone: "02100000000" },
    patient: { id: "p1", fullName: "بیمار آزمایشی", age: 30, phone: "09000000000", status: "تحت درمان", nationalId: "0000000000", fileNumber: "TEST-001" },
    report: { id: "TEST-REPORT-001", createdAt: "2026-10-07T10:00:00Z", author: { name: "پزشک نمونه", phone: null }, content: "این متن صرفاً برای بررسی خوانایی فارسی و چیدمان برگه چاپ است.\nRoot canal treatment completed. Follow-up appointment recommended.\nبند فارسی بعد از متن انگلیسی؛ ترتیب سطرها و نشانه‌گذاری بررسی می‌شود." },
    images: [image],
  };
  http.createServer((req, res) => {
    const long = req.url === "/long";
    const report = long ? { ...data.report, content: Array.from({ length: 35 }, (_, index) => `${index + 1}. ${data.report.content}`).join("\n\n") } : data.report;
    const markup = renderToStaticMarkup(React.createElement(ReportSheet, { data: { ...data, report }, selectedImages: ["i1"], captions: { i1: "تصویر نمونه برای بررسی چیدمان؛ رادیولوژی واقعی نیست." } }));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>DentVision print QA</title><style>${css}</style></head><body><main class="report-print-page bg-slate-100 p-6"><div class="print:hidden mx-auto mb-4 max-w-4xl rounded-xl bg-white p-4">نمونه آزمایشی چاپ — هیچ اطلاعات بیمار واقعی استفاده نشده است.<br><a href="/long">گزارش طولانی</a> · <a href="/">گزارش کوتاه</a><button onclick="window.print()" class="mr-4 rounded-xl bg-sky-500 p-3 text-white">چاپ نمونه</button></div>${markup}</main></body></html>`);
  }).listen(4179, "127.0.0.1", () => console.log("Read-only print fixture: http://localhost:4179"));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
