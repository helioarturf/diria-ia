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
