export interface PatientRecord {
  id: string;
  fullName: string;
  fileNumber: string;
  nationalId: string;
  age: number;
  phone: string;
  status: string;
  medicalHistory: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  clinicId: string;
  userId?: string | null;
  images?: Array<{
    id: string;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }>;
  reports?: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: { name: string };
  }>;
}

export interface NewPatientInput {
  fullName: string;
  nationalId: string;
  fileNumber: string;
  age: number;
  phone: string;
  status: string;
  medicalHistory: string;
  username?: string;
  patientPassword?: string;
}
