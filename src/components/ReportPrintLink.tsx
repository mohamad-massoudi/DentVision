import Link from "next/link";

export default function ReportPrintLink({ patientId, reportId }: { patientId: string; reportId: string }) {
  return <Link href={`/patients/${encodeURIComponent(patientId)}/reports/${encodeURIComponent(reportId)}/print`} target="_blank" rel="noopener noreferrer" className="print:hidden mt-3 inline-block rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700">چاپ / دریافت PDF گزارش</Link>;
}
