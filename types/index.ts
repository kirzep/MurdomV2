export type CatStatus = "В приюте" | "Дома";

export enum Role {
  VOLUNTEER = 'VOLUNTEER',
  MEDICAL_STAFF = 'MEDICAL_STAFF',
  TRUSTED_PERSON = 'TRUSTED_PERSON',
  DEVELOPER = 'DEVELOPER',
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  role: Role;
  image?: string | null;
}

export enum TreatmentType {
  WORMS = 'WORMS',
  FLEAS = 'FLEAS',
  EAR_MITES = 'EAR_MITES',
  VACCINATION = 'VACCINATION',
}

export interface Treatment {
  id: string;
  catId: string;
  type: TreatmentType;
  date: string;
  productName: string;
  createdAt: string;
  vaccinationStage?: 'first' | 'second' | 'revaccination' | null;
}

export interface Document {
  id: string;
  catId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  createdAt: string;
}

export interface Cat {
  id: string;
  name: string;
  avatarUrl: string | null;
  arrivalDate: string | null;
  birthYear: number | null;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
  status: CatStatus;
  treatments?: Treatment[];
  documents?: Document[];
  creatorId: string | null;
  creator: User | null;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
      id: string;
      name: string;
      image?: string | null;
  };
}

export interface AuditLog {
    id: string;
    createdAt: string;
    change: string;
    user: User;
}