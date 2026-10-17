export type ExperienceRole =
  | 'Cidadão / Utente'
  | 'Estudante de Direito'
  | 'Advogado / Jurista'
  | 'Empresário / Gestor de RH';

export type ExperienceLevel = 'Iniciante' | 'Intermédio' | 'Avançado / Especialista';

export type ResponseStyle =
  | 'Prático & Directo'
  | 'Equilibrado & Fundamentado'
  | 'Parecer Técnico Forense';

export interface UserProfile {
  id: string;
  name: string;
  role: ExperienceRole;
  experienceLevel: ExperienceLevel;
  responseStyle: ResponseStyle;
  primaryAreas: string[];
  province: string;
  institutionOrFirm?: string;
  email?: string;
  phone?: string;
  oaaNumber?: string;
}

export interface Lawyer {
  id: string;
  name: string;
  oaaNumber: string;
  location: string;
  specialty: string;
  phone?: string;
  email?: string;
  photoUrl: string;
  available: boolean;
  entityType?: 'Advogado Singular' | 'Advogado Estagiário' | 'Sociedade de Advogados / Escritório';
  province?: string;
  address?: string;
  bio?: string;
  website?: string;
  verifiedOaa?: boolean;
  registeredAt?: string;
  rating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
}

export interface LegalCitation {
  law: string;
  article: string;
  text: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citation?: LegalCitation;
  complexity?: 'Baixa' | 'Média' | 'Elevada';
  lawyers?: Lawyer[];
  suggestions?: string[];
  audioUrl?: string;
  audioDuration?: string;
  attachedDoc?: {
    name: string;
    size?: string;
  };
}

export interface Consultation {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  messages: Message[];
  active?: boolean;
}

export interface LegalCode {
  id: string;
  title: string;
  number: string;
  promulgationYear: string;
  category: string;
  status: 'Vigente' | 'Revogado Parcialmente';
  description: string;
  keyArticles: {
    article: string;
    topic: string;
    summary: string;
  }[];
}

export type DiplomaType =
  | 'Lei'
  | 'Decreto Presidencial'
  | 'Decreto Executivo'
  | 'Resolução'
  | 'Aviso BNA'
  | 'Despacho'
  | 'Código';

export type DiplomaStatus = 'Vigente' | 'Alterado' | 'Revogado Parcialmente' | 'Revogado';

export interface DiplomaArticle {
  number: string;
  title: string;
  content: string;
}

export interface LegalDiploma {
  id: string;
  number: string;
  title: string;
  type: DiplomaType;
  date: string;
  year: number;
  diarioRepublica: string;
  issuer: string;
  category: string;
  status: DiplomaStatus;
  summary: string;
  fullText?: string;
  keyArticles?: DiplomaArticle[];
  sourceUrl?: string;
  tags: string[];
}

export interface LaborCalculationResult {
  monthlySalary: number;
  yearsOfService: number;
  monthsOfService: number;
  noticeGiven: boolean;
  compensationAmount: number; // Indemnização por tempo de serviço
  noticeAmount: number; // Salário de aviso prévio
  holidaysProportional: number; // Férias proporcionais
  holidayAllowance: number; // Subsídio de férias
  christmasAllowance: number; // Subsídio de Natal proporcional
  grossTotal: number;
  inssDeduction: number; // 3%
  estimatedIrt: number; // IRT progressivo
  netTotal: number;
  legalBasis: string;
}

export type DocumentType =
  | 'Minuta'
  | 'Parecer Técnico'
  | 'Cálculo Laboral'
  | 'Contrato'
  | 'Petição Forense'
  | 'Notificação';

export type DocumentStatus = 'Finalizado' | 'Rascunho' | 'Em Revisão';

export interface UserDocument {
  id: string;
  title: string;
  category: string;
  type: DocumentType;
  createdAt: string;
  updatedAt: string;
  status: DocumentStatus;
  content: string;
  description?: string;
  fileSize?: string;
  tags?: string[];
  lawyerName?: string;
  consultationId?: string;
}

export interface LawyerReview {
  id: string;
  lawyerId: string;
  lawyerName?: string;
  authorName: string;
  authorRole?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  tags?: string[];
  criteria?: {
    clarity: number; // 1 to 5 (Clareza jurídica)
    efficiency: number; // 1 to 5 (Agilidade e prontidão)
    resolution: number; // 1 to 5 (Eficácia no caso)
  };
  verified?: boolean;
}

export type ConsultationRequestStatus = 'Pendente' | 'Confirmada' | 'Realizada' | 'Recusada';

export interface ConsultationRequest {
  id: string;
  lawyerId: string;
  lawyerName: string;
  clientName: string;
  clientPhone: string;
  preferredDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  modality: 'Presencial' | 'Videoconferência (Online)';
  subject: string;
  status: ConsultationRequestStatus;
  createdAt: string;
  caseNotes?: string;
  estimatedFee?: string;
  rejectReason?: string;
}

export type ScheduleEventType =
  | 'Audiência Judicial'
  | 'Mediação IGT'
  | 'Consulta Cliente'
  | 'Diligência Notarial / Registo'
  | 'Reunião de Sócios';

export type ScheduleEventStatus = 'Agendado' | 'Realizado' | 'Adiado' | 'Cancelado';

export interface LawyerScheduleEvent {
  id: string;
  lawyerId: string;
  lawyerName?: string;
  title: string;
  type: ScheduleEventType;
  date: string;
  time: string;
  location: string;
  clientName?: string;
  status: ScheduleEventStatus;
  notes?: string;
}

export interface DatabaseStatus {
  success: boolean;
  mode: 'mysql' | 'self-contained' | 'not-initialized';
  databaseName?: string;
  host?: string;
  port?: number | string;
  user?: string;
  connected: boolean;
  tablesCount: number;
  tables: string[];
  seeded: boolean;
  message: string;
  recordsSummary?: {
    users: number;
    lawyers: number;
    consultations: number;
    documents: number;
    laborSimulations: number;
  };
  cpanelDetected?: boolean;
  cpanelUser?: string;
  timestamp: string;
}

