import React, { useState, useMemo } from 'react';
import {
  Consultation,
  Lawyer,
  UserDocument,
  LawyerReview,
  UserProfile,
  DocumentType,
  DocumentStatus,
} from '../types';
import { AuthUser, DEMO_ACCOUNTS } from './AuthModal';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultations: Consultation[];
  activeConsultationId: string;
  onSelectConsultation: (id: string) => void;
  onNewConsultation: () => void;
  onDeleteConsultation?: (id: string) => void;
  lawyers: Lawyer[];
  reviews: LawyerReview[];
  onAddReview: (review: Omit<LawyerReview, 'id' | 'date'>) => void;
  documents: UserDocument[];
  onSaveDocument: (doc: UserDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onScheduleLawyer: (lawyer: Lawyer) => void;
  onContactLawyer: (lawyer: Lawyer) => void;
  userProfile?: UserProfile;
  currentUser?: AuthUser | null;
  onOpenProfile?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register', promptMessage?: string) => void;
  onOpenLawyerPortal?: () => void;
  onLogin?: (user: AuthUser) => void;
  isLoggedIn?: boolean;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  consultations,
  onSelectConsultation,
  onNewConsultation,
  onDeleteConsultation,
  lawyers,
  reviews,
  onAddReview,
  documents,
  onSaveDocument,
  onDeleteDocument,
  onScheduleLawyer,
  onContactLawyer,
  userProfile,
  currentUser,
  onOpenProfile,
  onOpenAuth,
  onOpenLawyerPortal,
  onLogin,
  isLoggedIn = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'history' | 'lawyers' | 'reviews'>('overview');

  // Document states
  const [docSearch, setDocSearch] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('Todas');
  const [previewingDoc, setPreviewingDoc] = useState<UserDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<UserDocument | null>(null);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);

  // New doc form
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Direito Laboral');
  const [newDocType, setNewDocType] = useState<DocumentType>('Minuta');
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');

  // History states
  const [historySearch, setHistorySearch] = useState('');
  const [selectedConsultationForView, setSelectedConsultationForView] = useState<Consultation | null>(null);

  // Lawyers & Reviews states
  const [lawyerSearch, setLawyerSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<'all' | 'firm' | 'individual'>('all');
  const [lawyerSpecialtyFilter, setLawyerSpecialtyFilter] = useState('Todas');
  const [sortLawyersBy, setSortLawyersBy] = useState<'rating' | 'reviews' | 'name'>('rating');
  const [evaluatingLawyer, setEvaluatingLawyer] = useState<Lawyer | null>(null);
  const [viewingLawyerReviews, setViewingLawyerReviews] = useState<Lawyer | null>(null);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newClarityRating, setNewClarityRating] = useState(5);
  const [newEfficiencyRating, setNewEfficiencyRating] = useState(5);
  const [newResolutionRating, setNewResolutionRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(userProfile?.name || 'Utente Anónimo');

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Unauthenticated Guard
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px] text-emerald-400">space_dashboard</span>
              </div>
              <div>
                <h2 className="text-base font-bold font-headline text-white">Painel do Utente</h2>
                <p className="text-xs text-slate-300">Acesso Restrito a Utilizadores Autenticados</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <span className="material-symbols-outlined text-[30px]">lock</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Inicie Sessão para Aceder ao Painel</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                O seu Painel do Utente centraliza documentos jurídicos criados, histórico de consultas e avaliações aos advogados. Para proteger os seus dados, é necessário autenticar-se.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth?.('login', 'Inicie sessão para aceder ao seu Painel do Utente.');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">login</span>
                <span>Iniciar Sessão</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth?.('register');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
                <span>Criar Conta Gratuita</span>
              </button>
            </div>

            {/* Quick Demo Login */}
            <div className="pt-4 border-t border-slate-100 text-left">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Ou teste com uma conta de demonstração:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => {
                      onLogin?.(demo.user);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-white text-left transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-1">
                      <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-emerald-700">
                        {demo.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{demo.badge}</div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-600 shrink-0">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = docCategoryFilter === 'Todas' || doc.category.toLowerCase().includes(docCategoryFilter.toLowerCase());
    const matchesSearch =
      doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.content.toLowerCase().includes(docSearch.toLowerCase()) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(docSearch.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Filtered consultations
  const filteredConsultations = consultations.filter((c) => {
    const query = historySearch.toLowerCase();
    const matchesTitle = c.title.toLowerCase().includes(query);
    const matchesMessages = c.messages.some((m) => m.content.toLowerCase().includes(query));
    return matchesTitle || matchesMessages;
  });

  // Filtered lawyers
  const filteredLawyers = lawyers.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(lawyerSearch.toLowerCase()) ||
      l.location.toLowerCase().includes(lawyerSearch.toLowerCase()) ||
      l.specialty.toLowerCase().includes(lawyerSearch.toLowerCase()) ||
      l.oaaNumber.includes(lawyerSearch);

    const matchesEntity =
      entityFilter === 'all' ||
      (entityFilter === 'firm' && l.entityType === 'Sociedade de Advogados / Escritório') ||
      (entityFilter === 'individual' && l.entityType !== 'Sociedade de Advogados / Escritório');

    const matchesSpec =
      lawyerSpecialtyFilter === 'Todas' ||
      l.specialty.toLowerCase().includes(lawyerSpecialtyFilter.toLowerCase());

    return matchesSearch && matchesEntity && matchesSpec;
  }).sort((a, b) => {
    if (sortLawyersBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortLawyersBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
    return a.name.localeCompare(b.name);
  });

  // User's own reviews
  const myReviews = reviews.filter(
    (r) => r.authorName.toLowerCase() === (userProfile?.name || '').toLowerCase() || r.authorName === 'Paulo Miranda'
  );

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadText = (title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_DirIA_Angola.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const newDoc: UserDocument = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      category: newDocCategory,
      type: newDocType,
      createdAt: 'Hoje',
      updatedAt: 'Agora',
      status: 'Finalizado',
      description: newDocDesc.trim() || 'Minuta jurídica elaborada pelo utente no DirIA.',
      content: newDocContent.trim() || 'Conteúdo preliminar da peça jurídica.',
      fileSize: `${Math.max(2, Math.round(newDocContent.length / 120))} KB`,
      tags: [newDocCategory.split(' ')[0], newDocType],
    };

    onSaveDocument(newDoc);
    setIsCreatingDoc(false);
    setNewDocTitle('');
    setNewDocContent('');
    setNewDocDesc('');
    setActiveTab('documents');
  };

  const handleSaveEditedDoc = () => {
    if (!editingDoc) return;
    onSaveDocument({
      ...editingDoc,
      updatedAt: 'Agora',
    });
    setEditingDoc(null);
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingLawyer) return;

    onAddReview({
      lawyerId: evaluatingLawyer.id,
      lawyerName: evaluatingLawyer.name,
      authorName: reviewerName.trim() || userProfile?.name || 'Utente DirIA',
      authorRole: userProfile?.role || 'Cidadão / Utente',
      rating: newRating,
      comment: newReviewComment.trim() || 'Serviço prestado com elevado rigor e cumprimento dos prazos legais da OAA.',
      criteria: {
        clarity: newClarityRating,
        efficiency: newEfficiencyRating,
        resolution: newResolutionRating,
      },
      tags: ['Avaliação Verificada', evaluatingLawyer.entityType === 'Sociedade de Advogados / Escritório' ? 'Sociedade' : 'Advogado'],
      verified: true,
    });

    setEvaluatingLawyer(null);
    setNewReviewComment('');
    setActiveTab('lawyers');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 shadow-2xl w-full max-w-6xl h-full sm:h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-3 py-2.5 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[19px] sm:text-[22px]">space_dashboard</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-sm sm:text-lg font-bold font-headline text-slate-900 truncate">
                  Painel do Utente
                </h2>
                <span className="px-1.5 sm:px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 truncate">
                  {(currentUser?.role || userProfile?.role || 'Utente').split(' ')[0]}
                </span>
                {currentUser?.email && (
                  <span className="hidden lg:inline-block px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-600 font-mono">
                    {currentUser.email}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block truncate">
                Documentos jurídicos criados, histórico de consultas, directório e avaliações
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Switch to Lawyer Portal if user is lawyer */}
            {(currentUser?.role === 'Advogado / Jurista' || currentUser?.isRegisteredLawyer) && onOpenLawyerPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLawyerPortal();
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 text-[11px] sm:text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Aceder ao Painel Profissional do Advogado (OAA)"
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-amber-400">gavel</span>
                <span className="hidden md:inline">Painel do Advogado</span>
                <span className="px-1 py-0.1 bg-amber-400 text-slate-950 rounded text-[9px] font-mono font-bold">OAA</span>
              </button>
            )}

            {/* User Profile Chip */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Ver ou Editar Perfil do Utilizador"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600">account_circle</span>
              <span className="max-w-[70px] sm:max-w-[120px] truncate hidden sm:inline">
                {currentUser?.name || userProfile?.name || 'Utente'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Fechar Painel"
            >
              <span className="material-symbols-outlined text-[19px] sm:text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-2 sm:px-6 bg-white border-b border-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto custom-scroll shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[18px]">dashboard</span>
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'documents'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[18px]">description</span>
            <span className="hidden sm:inline">Documentos Criados</span>
            <span className="sm:hidden">Documentos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[18px]">forum</span>
            <span className="hidden sm:inline">Histórico de Consultas</span>
            <span className="sm:hidden">Consultas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
              {consultations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lawyers')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'lawyers'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[18px]">verified</span>
            <span className="hidden sm:inline">Juristas & Escritórios</span>
            <span className="sm:hidden">Juristas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800">
              {lawyers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[18px]">star</span>
            <span className="hidden sm:inline">Minhas Avaliações</span>
            <span className="sm:hidden">Avaliações</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
              {myReviews.length}
            </span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3 sm:p-6 custom-scroll">
          {/* 1. VISÃO GERAL TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Profile Card Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs uppercase tracking-wider text-emerald-300 font-mono font-medium">
                      Espaço Pessoal do Utente
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-emerald-200 border border-white/20">
                      Atribuição: {currentUser?.role || userProfile?.role || 'Utente'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-headline">
                    Olá, {currentUser?.name || userProfile?.name || 'Utente'}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Acesso integral ao seu dossier de peças processuais, minutas oficiais de Angola, consultas guardadas com a DirIA e directorio certificado da Ordem dos Advogados (OAA).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                  <button
                    onClick={() => {
                      onNewConsultation();
                      onClose();
                    }}
                    className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">add_comment</span>
                    <span>Nova Consulta</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsCreatingDoc(true);
                      setActiveTab('documents');
                    }}
                    className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">note_add</span>
                    <span>Criar Documento</span>
                  </button>
                </div>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div
                  onClick={() => setActiveTab('documents')}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Documentos Salvos</span>
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[19px]">description</span>
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-headline text-slate-900">
                    {documents.length}
                  </div>
                  <p className="text-[11px] text-sky-700 font-medium mt-1 flex items-center gap-0.5">
                    Ver minutas e peças &rarr;
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('history')}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Consultas Realizadas</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[19px]">forum</span>
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-headline text-slate-900">
                    {consultations.length}
                  </div>
                  <p className="text-[11px] text-purple-700 font-medium mt-1 flex items-center gap-0.5">
                    Aceder ao histórico &rarr;
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('lawyers')}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Escritórios & Juristas</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[19px]">verified</span>
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-headline text-slate-900">
                    {lawyers.length}
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-0.5">
                    Ver avaliações e contactos &rarr;
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('reviews')}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Avaliações Feitas</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[19px]">star</span>
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-headline text-slate-900">
                    {myReviews.length}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-0.5">
                    Avaliar profissionais &rarr;
                  </p>
                </div>
              </div>

              {/* Two columns: Recent Documents & Recent Consultations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent Documents Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-700 text-[20px]">description</span>
                      <h4 className="text-sm font-semibold text-slate-900 font-headline">
                        Documentos e Minutas Recentes
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="text-xs text-emerald-700 font-medium hover:underline cursor-pointer"
                    >
                      Ver todos ({documents.length})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                              {doc.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{doc.updatedAt}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {doc.title}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {doc.description || doc.category}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setPreviewingDoc(doc)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer"
                            title="Visualizar Minuta"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <button
                            onClick={() => handleDownloadText(doc.title, doc.content)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer"
                            title="Descarregar .txt"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Consultations Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-700 text-[20px]">forum</span>
                      <h4 className="text-sm font-semibold text-slate-900 font-headline">
                        Consultas Jurídicas Recentes
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-xs text-emerald-700 font-medium hover:underline cursor-pointer"
                    >
                      Ver todas ({consultations.length})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {consultations.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {c.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{c.updatedAt}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {c.title}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {c.messages.length > 0 ? c.messages[0].content : 'Sessão em curso'}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            onSelectConsultation(c.id);
                            onClose();
                          }}
                          className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          title="Retomar consulta no chat"
                        >
                          <span className="material-symbols-outlined text-[15px]">chat</span>
                          <span>Retomar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured Top Rated Law Firms & Lawyers Preview */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 font-headline">
                      Sociedades & Advogados Melhor Avaliados pelos Utentes
                    </h4>
                    <p className="text-xs text-slate-500">
                      Profissionais inscritos na OAA com avaliações activas e índice de resolução comprovado
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('lawyers')}
                    className="text-xs text-emerald-700 font-medium hover:underline cursor-pointer"
                  >
                    Directório Completo &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {lawyers.slice(0, 3).map((l) => (
                    <div
                      key={l.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition-colors flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <img
                          src={l.photoUrl}
                          alt={l.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">{l.name}</div>
                          <div className="text-[11px] text-emerald-700 font-medium truncate mt-0.5">
                            {l.specialty}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{l.location}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                          <span className="material-symbols-outlined text-[15px]">star</span>
                          <span>{l.rating?.toFixed(1) || '4.9'}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({l.reviewCount || 15})
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setEvaluatingLawyer(l);
                          }}
                          className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-slate-300 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                        >
                          Avaliar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. DOCUMENTOS CRIADOS TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              {/* Header toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Pesquisar documento por título, cláusula ou palavra-chave..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={docCategoryFilter}
                    onChange={(e) => setDocCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 px-3 py-2 focus:outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="Todas">Todas as Áreas</option>
                    <option value="Laboral">Direito Laboral</option>
                    <option value="Comercial">Direito Comercial</option>
                    <option value="Civil">Direito Civil</option>
                    <option value="Família">Direito da Família</option>
                  </select>

                  <button
                    onClick={() => setIsCreatingDoc(true)}
                    className="h-9 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Novo Documento</span>
                  </button>
                </div>
              </div>

              {/* Documents List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-100 font-mono">
                            {doc.type}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {doc.category}
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          doc.status === 'Finalizado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {doc.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold font-headline text-slate-900 line-clamp-2">
                        {doc.title}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {doc.description || doc.content.slice(0, 140)}
                      </p>

                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {doc.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {doc.createdAt}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewingDoc(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                          title="Visualizar Minuta em Tela Cheia"
                        >
                          <span className="material-symbols-outlined text-[15px]">visibility</span>
                          <span>Ver</span>
                        </button>

                        <button
                          onClick={() => setEditingDoc(doc)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                          title="Editar Minuta"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(doc.content, doc.id)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                          title="Copiar Conteúdo"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {copiedId === doc.id ? 'check' : 'content_copy'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleDownloadText(doc.title, doc.content)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                          title="Descarregar Texto (.txt)"
                        >
                          <span className="material-symbols-outlined text-[15px]">download</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Pretende eliminar o documento "${doc.title}"?`)) {
                              onDeleteDocument(doc.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Eliminar Documento"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredDocuments.length === 0 && (
                  <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
                    <span className="material-symbols-outlined text-4xl text-slate-300">description</span>
                    <p className="text-sm">Nenhum documento encontrado com os critérios de pesquisa.</p>
                    <button
                      onClick={() => setIsCreatingDoc(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Criar Primeira Minuta
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. HISTÓRICO DE CONSULTAS TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              {/* Search toolbar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Pesquisar em todas as consultas por palavra, artigo ou lei..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
                  />
                </div>

                <button
                  onClick={() => {
                    onNewConsultation();
                    onClose();
                  }}
                  className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs whitespace-nowrap self-end sm:self-auto"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Nova Consulta</span>
                </button>
              </div>

              {/* Consultation Cards */}
              <div className="space-y-3">
                {filteredConsultations.map((c) => {
                  const userMessages = c.messages.filter((m) => m.role === 'user');
                  const aiMessages = c.messages.filter((m) => m.role === 'assistant');

                  return (
                    <div
                      key={c.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">
                              {c.category}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {c.updatedAt}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              {c.messages.length} mensagens
                            </span>
                          </div>
                          <h4 className="text-sm font-bold font-headline text-slate-900">
                            {c.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => {
                              onSelectConsultation(c.id);
                              onClose();
                            }}
                            className="h-8 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                            title="Retomar esta conversa no chat principal"
                          >
                            <span className="material-symbols-outlined text-[15px]">send</span>
                            <span>Retomar no Chat</span>
                          </button>

                          <button
                            onClick={() => setSelectedConsultationForView(c)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title="Ver histórico completo de mensagens"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          {onDeleteConsultation && consultations.length > 1 && (
                            <button
                              onClick={() => {
                                if (confirm(`Pretende eliminar a consulta "${c.title}"?`)) {
                                  onDeleteConsultation(c.id);
                                }
                              }}
                              className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Eliminar Consulta"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Snippet preview */}
                      {c.messages.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                          <div className="flex items-start gap-2 text-slate-700">
                            <span className="font-semibold text-slate-900 shrink-0">Utente:</span>
                            <p className="line-clamp-2 text-slate-600">
                              {userMessages[0]?.content || 'Pergunta não registada.'}
                            </p>
                          </div>
                          {aiMessages[0] && (
                            <div className="flex items-start gap-2 text-slate-700 pt-1 border-t border-slate-200/60">
                              <span className="font-semibold text-emerald-800 shrink-0 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                                DirIA:
                              </span>
                              <p className="line-clamp-2 text-slate-600">
                                {aiMessages[0].content}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredConsultations.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">forum</span>
                    <p className="text-sm">Nenhuma consulta encontrada com a pesquisa efectuada.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. JURISTAS, ESCRITÓRIOS & AVALIAÇÕES TAB */}
          {activeTab === 'lawyers' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              {/* Filter and Search Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={lawyerSearch}
                      onChange={(e) => setLawyerSearch(e.target.value)}
                      placeholder="Pesquisar por advogado, escritório, província, cédula OAA..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={sortLawyersBy}
                      onChange={(e) => setSortLawyersBy(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 px-3 py-2 focus:outline-none cursor-pointer"
                    >
                      <option value="rating">Melhor Avaliados ★</option>
                      <option value="reviews">Mais Avaliações</option>
                      <option value="name">Ordem Alfabética</option>
                    </select>

                    <select
                      value={lawyerSpecialtyFilter}
                      onChange={(e) => setLawyerSpecialtyFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 px-3 py-2 focus:outline-none cursor-pointer"
                    >
                      <option value="Todas">Todas as Especialidades</option>
                      <option value="Laboral">Laboral & IGT</option>
                      <option value="Comercial">Comercial & Fiscal</option>
                      <option value="Família">Família & Sucessões</option>
                      <option value="Penal">Penal Económico</option>
                      <option value="Terras">Imobiliário & Terras</option>
                    </select>
                  </div>
                </div>

                {/* Sub-tabs: Todos vs Advogados Singulares vs Sociedades */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 overflow-x-auto custom-scroll">
                  <button
                    onClick={() => setEntityFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      entityFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos os Inscritos ({lawyers.length})
                  </button>
                  <button
                    onClick={() => setEntityFilter('firm')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      entityFilter === 'firm'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Sociedades & Escritórios ({lawyers.filter((l) => l.entityType === 'Sociedade de Advogados / Escritório').length})
                  </button>
                  <button
                    onClick={() => setEntityFilter('individual')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      entityFilter === 'individual'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Advogados Singulares ({lawyers.filter((l) => l.entityType !== 'Sociedade de Advogados / Escritório').length})
                  </button>
                </div>
              </div>

              {/* Lawyers & Firms Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLawyers.map((l) => {
                  const lawyerReviews = reviews.filter((r) => r.lawyerId === l.id);
                  const isFirm = l.entityType === 'Sociedade de Advogados / Escritório';

                  return (
                    <div
                      key={l.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        {/* Header Profile */}
                        <div className="flex items-start gap-3.5">
                          <img
                            src={l.photoUrl}
                            alt={l.name}
                            className={`w-14 h-14 object-cover border border-slate-200 shrink-0 ${
                              isFirm ? 'rounded-xl' : 'rounded-full'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-sm font-bold font-headline text-slate-900 truncate">
                                {l.name}
                              </h4>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                                isFirm
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {isFirm ? 'Sociedade / Escritório' : 'Advogado Singular'}
                              </span>

                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                OAA #{l.oaaNumber}
                              </span>

                              {l.verifiedOaa && (
                                <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-700">
                                  <span className="material-symbols-outlined text-[13px]">verified</span>
                                  Verificado
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-emerald-800 font-medium mt-1">
                              {l.specialty}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {l.location}
                            </p>
                          </div>
                        </div>

                        {/* Bio or overview */}
                        {l.bio && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                            {l.bio}
                          </p>
                        )}

                        {/* Ratings overview bar */}
                        <div className="p-3 bg-amber-50/50 border border-amber-100/80 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-amber-500">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`material-symbols-outlined text-[17px] ${
                                    star <= Math.round(l.rating || 4.8)
                                      ? 'text-amber-500 fill-1'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-900">
                              {l.rating?.toFixed(1) || '4.8'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-normal">
                              ({lawyerReviews.length || l.reviewCount || 12} avaliações)
                            </span>
                          </div>

                          <button
                            onClick={() => setViewingLawyerReviews(l)}
                            className="text-xs text-amber-800 font-semibold hover:underline cursor-pointer"
                          >
                            Ver opiniões &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => setEvaluatingLawyer(l)}
                          className="flex-1 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">rate_review</span>
                          <span>Avaliar Profissional</span>
                        </button>

                        <button
                          onClick={() => onScheduleLawyer(l)}
                          className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          title="Agendar Consulta Presencial ou Online"
                        >
                          <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                          <span className="hidden sm:inline">Agendar</span>
                        </button>

                        <button
                          onClick={() => onContactLawyer(l)}
                          className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
                          title="Contactar directamente"
                        >
                          <span className="material-symbols-outlined text-[16px]">call</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. MINHAS AVALIAÇÕES SUBMETIDAS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-900">
                    Minhas Avaliações & Pareceres Públicos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Avaliações de experiência com advogados e sociedades de advogados registadas em seu nome
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('lawyers')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Avaliar Mais Juristas
                </button>
              </div>

              <div className="space-y-3">
                {myReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-headline">
                          {rev.lawyerName || 'Profissional OAA'}
                        </span>
                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`material-symbols-outlined text-[16px] ${
                                s <= rev.rating ? 'text-amber-500' : 'text-slate-300'
                              }`}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{rev.date}</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{rev.comment}"
                    </p>

                    {rev.criteria && (
                      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-500">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 text-[10px]">Clareza Jurídica</span>
                          <span className="font-semibold text-slate-800">{rev.criteria.clarity}/5 ★</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 text-[10px]">Agilidade & Prazos</span>
                          <span className="font-semibold text-slate-800">{rev.criteria.efficiency}/5 ★</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="block text-slate-400 text-[10px]">Resolução do Litígio</span>
                          <span className="font-semibold text-slate-800">{rev.criteria.resolution}/5 ★</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {myReviews.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
                    <span className="material-symbols-outlined text-4xl text-amber-300">star</span>
                    <p className="text-sm">Ainda não submeteu avaliações para juristas ou escritórios.</p>
                    <button
                      onClick={() => setActiveTab('lawyers')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Explorar Escritórios e Avaliar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL / SUB-PANEL: AVALIAR JURISTA / ESCRITÓRIO */}
        {evaluatingLawyer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">star</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-headline text-slate-900">
                      Avaliar {evaluatingLawyer.entityType === 'Sociedade de Advogados / Escritório' ? 'Escritório' : 'Jurista'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {evaluatingLawyer.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEvaluatingLawyer(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
                {/* Global Stars */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Classificação Geral (1 a 5 estrelas):
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating(s)}
                        className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                      >
                        <span
                          className={`material-symbols-outlined text-[30px] ${
                            s <= newRating ? 'text-amber-500' : 'text-slate-300'
                          }`}
                        >
                          star
                        </span>
                      </button>
                    ))}
                    <span className="text-sm font-bold text-slate-800 ml-2">
                      {newRating} / 5
                    </span>
                  </div>
                </div>

                {/* Sub-criteria ratings */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Clareza & Comunicação Jurídica:</span>
                    <select
                      value={newClarityRating}
                      onChange={(e) => setNewClarityRating(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800"
                    >
                      <option value="5">5 - Excelente</option>
                      <option value="4">4 - Muito Bom</option>
                      <option value="3">3 - Regular</option>
                      <option value="2">2 - Insuficiente</option>
                      <option value="1">1 - Fraco</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Agilidade & Cumprimento de Prazos:</span>
                    <select
                      value={newEfficiencyRating}
                      onChange={(e) => setNewEfficiencyRating(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800"
                    >
                      <option value="5">5 - Excelente</option>
                      <option value="4">4 - Muito Bom</option>
                      <option value="3">3 - Regular</option>
                      <option value="2">2 - Insuficiente</option>
                      <option value="1">1 - Fraco</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Resolução Efectiva da Causa:</span>
                    <select
                      value={newResolutionRating}
                      onChange={(e) => setNewResolutionRating(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800"
                    >
                      <option value="5">5 - Excelente</option>
                      <option value="4">4 - Muito Bom</option>
                      <option value="3">3 - Regular</option>
                      <option value="2">2 - Insuficiente</option>
                      <option value="1">1 - Fraco</option>
                    </select>
                  </div>
                </div>

                {/* Reviewer name */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Seu Nome ou Identificação:
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Ex: Helena Santos, Utente de Luanda"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400"
                  />
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Comentário e Testemunho da Experiência:
                  </label>
                  <textarea
                    rows={4}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Descreva como foi o atendimento, a competência técnica demonstrada perante a IGT ou Tribunal e se recomenda a outros utentes..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEvaluatingLawyer(null)}
                    className="flex-1 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Submeter Avaliação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL / SUB-PANEL: VER AVALIAÇÕES DE UM JURISTA/ESCRITÓRIO */}
        {viewingLawyerReviews && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={viewingLawyerReviews.photoUrl}
                    alt={viewingLawyerReviews.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold font-headline text-slate-900">
                      {viewingLawyerReviews.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center text-amber-500 font-bold">
                        ★ {viewingLawyerReviews.rating?.toFixed(1) || '4.9'}
                      </span>
                      <span>•</span>
                      <span>OAA #{viewingLawyerReviews.oaaNumber}</span>
                      <span>•</span>
                      <span>{viewingLawyerReviews.location}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setViewingLawyerReviews(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scroll">
                {reviews
                  .filter((r) => r.lawyerId === viewingLawyerReviews.id)
                  .map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900">{rev.authorName}</span>
                          {rev.authorRole && (
                            <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                              ({rev.authorRole})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                className={`material-symbols-outlined text-[15px] ${
                                  s <= rev.rating ? 'text-amber-500 fill-1' : 'text-slate-300'
                                }`}
                              >
                                star
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        "{rev.comment}"
                      </p>

                      {rev.criteria && (
                        <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 font-mono">
                          <span>Clareza: {rev.criteria.clarity}/5</span>
                          <span>Agilidade: {rev.criteria.efficiency}/5</span>
                          <span>Resolução: {rev.criteria.resolution}/5</span>
                        </div>
                      )}
                    </div>
                  ))}

                {reviews.filter((r) => r.lawyerId === viewingLawyerReviews.id).length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    Este escritório ainda não possui avaliações públicas. Seja o primeiro a avaliar!
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => {
                    const target = viewingLawyerReviews;
                    setViewingLawyerReviews(null);
                    setEvaluatingLawyer(target);
                  }}
                  className="h-8 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Deixar Minha Avaliação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL / SUB-PANEL: PRÉ-VISUALIZAÇÃO DE DOCUMENTO EM TELA CHEIA */}
        {previewingDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      {previewingDoc.type}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{previewingDoc.category}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold font-headline text-slate-900 mt-0.5 truncate">
                    {previewingDoc.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyText(previewingDoc.content, previewingDoc.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedId === previewingDoc.id ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedId === previewingDoc.id ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadText(previewingDoc.title, previewingDoc.content)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Descarregar</span>
                  </button>

                  <button
                    onClick={() => setPreviewingDoc(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60 custom-scroll">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xs border border-slate-200">
                  <pre className="font-serif text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
                    {previewingDoc.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL / SUB-PANEL: EDIÇÃO DE DOCUMENTO */}
        {editingDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-[20px]">edit_note</span>
                  <h3 className="text-sm sm:text-base font-bold font-headline text-slate-900">
                    Editar Minuta / Peça Jurídica
                  </h3>
                </div>

                <button
                  onClick={() => setEditingDoc(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scroll">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Título do Documento:
                  </label>
                  <input
                    type="text"
                    value={editingDoc.title}
                    onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estado:
                    </label>
                    <select
                      value={editingDoc.status}
                      onChange={(e) => setEditingDoc({ ...editingDoc, status: e.target.value as DocumentStatus })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    >
                      <option value="Finalizado">Finalizado</option>
                      <option value="Rascunho">Rascunho</option>
                      <option value="Em Revisão">Em Revisão</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Área do Direito:
                    </label>
                    <input
                      type="text"
                      value={editingDoc.category}
                      onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Texto Integral da Peça (Cláusulas, Fundamentação & Termos):
                  </label>
                  <textarea
                    rows={14}
                    value={editingDoc.content}
                    onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedDoc}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Gravar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL / SUB-PANEL: CRIAR NOVO DOCUMENTO */}
        {isCreatingDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-[20px]">note_add</span>
                  <h3 className="text-sm sm:text-base font-bold font-headline text-slate-900">
                    Criar Novo Documento ou Minuta
                  </h3>
                </div>

                <button
                  onClick={() => setIsCreatingDoc(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateDocumentSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scroll">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Título do Documento:
                    </label>
                    <input
                      type="text"
                      required
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="Ex: Reclamação Laboral perante a IGT Luanda ou Contrato de Prestação de Serviços"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tipo de Peça:
                      </label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="Minuta">Minuta / Modelo Oficial</option>
                        <option value="Contrato">Contrato Comercial / Trabalho</option>
                        <option value="Petição Forense">Petição Forense / Procuração</option>
                        <option value="Parecer Técnico">Parecer Técnico Forense</option>
                        <option value="Cálculo Laboral">Cálculo Laboral</option>
                        <option value="Notificação">Notificação / Interpelação</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Área do Direito:
                      </label>
                      <select
                        value={newDocCategory}
                        onChange={(e) => setNewDocCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                      >
                        <option value="Direito Laboral">Direito Laboral & Segurança Social</option>
                        <option value="Direito Comercial">Direito Comercial & Sociedades</option>
                        <option value="Direito Civil">Direito Civil & Obrigações</option>
                        <option value="Direito Imobiliário">Direito Imobiliário & Terras</option>
                        <option value="Direito da Família">Direito da Família & Sucessões</option>
                        <option value="Direito Fiscal">Direito Fiscal & Aduaneiro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Breve Resumo ou Descrição do Caso:
                    </label>
                    <input
                      type="text"
                      value={newDocDesc}
                      onChange={(e) => setNewDocDesc(e.target.value)}
                      placeholder="Ex: Minuta formulada para exigir o pagamento de salários e proporcionais."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Corpo do Documento:
                    </label>
                    <textarea
                      rows={12}
                      required
                      value={newDocContent}
                      onChange={(e) => setNewDocContent(e.target.value)}
                      placeholder="Redija ou cole aqui as cláusulas, preâmbulo e dados das partes..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCreatingDoc(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Guardar no Meu Painel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL / SUB-PANEL: VISUALIZAR CONSULTA INTEGRAL */}
        {selectedConsultationForView && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                    {selectedConsultationForView.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold font-headline text-slate-900 mt-1">
                    {selectedConsultationForView.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const id = selectedConsultationForView.id;
                      setSelectedConsultationForView(null);
                      onSelectConsultation(id);
                      onClose();
                    }}
                    className="h-8 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    <span>Retomar no Chat</span>
                  </button>

                  <button
                    onClick={() => setSelectedConsultationForView(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 custom-scroll">
                {selectedConsultationForView.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-white border-slate-200 ml-auto max-w-xl text-slate-900 shadow-2xs'
                        : 'bg-emerald-50/50 border-emerald-100 mr-auto max-w-2xl text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                      <span className="font-semibold text-slate-700">
                        {m.role === 'user' ? 'Você (Utente)' : 'DirIA'}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {m.citation && (
                      <div className="mt-2.5 p-2 bg-emerald-100/60 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-mono">
                        <span className="font-bold">{m.citation.law} ({m.citation.article}):</span>{' '}
                        {m.citation.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
