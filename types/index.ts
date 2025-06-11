// types/index.ts

export enum Role {
  VOLUNTEER = 'VOLUNTEER',
  MEDICAL_STAFF = 'MEDICAL_STAFF',
  TRUSTED_PERSON = 'TRUSTED_PERSON',
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  role: Role;
  image?: string | null; // Добавлено поле для аватара
}

export enum TreatmentType {
  WORMS = 'WORMS',
  FLEAS = 'FLEAS',
  EAR_MITES = 'EAR_MITES',
}

export enum DocumentCategory {
  RECEIPT = 'RECEIPT',
  ANALYSES = 'ANALYSES',
  REPORTS = 'REPORTS',
  DEWORMING = 'Дегельминтизация',
  FLEA_TREATMENT = 'Обработка от блох',
  EAR_MITE_TREATMENT: 'Обработка от клещей',
  VACCINATION = 'Вакцинация',
  ILLNESS_REPORT: 'Выписка по болезни',
}

export interface Treatment {
  id: string;
  catId: string;
  type: TreatmentType;
  date: string;
  productName: string;
  createdAt: string;
}

export interface Document {
  id: string;
  catId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  category: DocumentCategory;
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
      image?: string | null; // Добавлено поле для аватара в чате
  };
}

export interface AuditLog {
    id: string;
    createdAt: string;
    change: string;
    user: User;
}
