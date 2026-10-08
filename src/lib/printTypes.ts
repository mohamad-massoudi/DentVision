import type { PatientRecord } from "./patientTypes";

export type PrintableReport = {
  clinic: { name: string; address: string; phone: string };
  patient: Pick<PatientRecord, "id" | "fullName" | "fileNumber" | "nationalId" | "age" | "phone" | "status">;
  report: { id: string; content: string; createdAt: string; author: { name: string; phone: string | null } };
  images: NonNullable<PatientRecord["images"]>;
};
