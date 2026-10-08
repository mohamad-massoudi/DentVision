import MedicalReportPrint from "@/components/MedicalReportPrint";
import { requirePageUser } from "@/lib/pageAuth";

export const metadata = { title: "چاپ گزارش درمان | DentVision", robots: { index: false, follow: false } };

export default async function PrintPage({ params }: { params: Promise<{ id: string; reportId: string }> }) {
  await requirePageUser();
  const { id, reportId } = await params;
  return <MedicalReportPrint key={`${id}:${reportId}`} patientId={id} reportId={reportId} />;
}
