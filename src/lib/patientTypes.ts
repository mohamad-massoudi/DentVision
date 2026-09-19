export interface PatientRecord {
  id: string;
  fullName: string;
  fileNumber: string;
  age: number;
  phone: string;
  status: string;
  medicalHistory: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewPatientInput {
  fullName: string;
  fileNumber: string;
  age: number;
  phone: string;
  status: string;
  medicalHistory: string;
}
