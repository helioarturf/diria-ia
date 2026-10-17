import React, { useState } from 'react';
import {
  Lawyer,
  ConsultationRequest,
  ConsultationRequestStatus,
  LawyerScheduleEvent,
  LawyerReview,
  UserProfile,
  ScheduleEventType,
} from '../types';
import { AuthUser, DEMO_ACCOUNTS } from './AuthModal';

interface LawyerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyers: Lawyer[];
  requests: ConsultationRequest[];
  onUpdateRequestStatus: (
    requestId: string,
    newStatus: ConsultationRequestStatus,
    details?: {
      scheduledDate?: string;
      scheduledTime?: string;
      caseNotes?: string;
      rejectReason?: string;
      estimatedFee?: string;
    }
  ) => void;
  scheduleEvents: LawyerScheduleEvent[];
  onAddScheduleEvent: (event: Omit<LawyerScheduleEvent, 'id'>) => void;
  onUpdateScheduleEventStatus: (
    eventId: string,
    newStatus: 'Agendado' | 'Realizado' | 'Adiado' | 'Cancelado'
  ) => void;
  reviews: LawyerReview[];
  userProfile?: UserProfile;
  currentUser?: AuthUser | null;
  isLoggedIn?: boolean;
  onOpenLawyerRegistration?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register', promptMessage?: string) => void;
  onSwitchToUserDashboard?: () => void;
  onUpgradeToLawyer?: (oaaNumber?: string) => void;
  onLogin?: (user: AuthUser) => void;
}

export const LawyerPortalModal: React.FC<LawyerPortalModalProps> = ({
  isOpen,
  onClose,
  lawyers,
  requests,
  onUpdateRequestStatus,
  scheduleEvents,
  onAddScheduleEvent,
  onUpdateScheduleEventStatus,
  reviews,
  userProfile,
  currentUser,
  isLoggedIn = false,
  onOpenLawyerRegistration,
  onOpenAuth,
  onSwitchToUserDashboard,
  onUpgradeToLawyer,
  onLogin,
}) => {
  // Active Lawyer/Firm Identity Selector
  const [activeLawyerId, setActiveLawyerId] = useState<string>(() => {
    return lawyers[0]?.id || 'lawyer-1';
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'schedule' | 'reports' | 'reviews'>('overview');

  // Requests filter states
  const [requestFilter, setRequestFilter] = useState<'Todas' | 'Pendente' | 'Confirmada' | 'Realizada' | 'Recusada'>('Todas');
  const [requestSearch, setRequestSearch] = useState('');

  // Request Action Modals
  const [acceptingRequest, setAcceptingRequest] = useState<ConsultationRequest | null>(null);
  const [acceptDate, setAcceptDate] = useState('2026-10-22');
  const [acceptTime, setAcceptTime] = useState('10:00');
  const [acceptFee, setAcceptFee] = useState('Kz 150.000,00');
  const [acceptNotes, setAcceptNotes] = useState('');

  const [rejectingRequest, setRejectingRequest] = useState<ConsultationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Incompatibilidade de agenda no período solicitado.');

  const [editingNotesRequest, setEditingNotesRequest] = useState<ConsultationRequest | null>(null);
  const [caseNotesDraft, setCaseNotesDraft] = useState('');

  // Schedule Event Creator Modal
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<ScheduleEventType>('Mediação IGT');
  const [newEventDate, setNewEventDate] = useState('2026-10-22');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventLocation, setNewEventLocation] = useState('Sala de Mediação da IGT Luanda, Mutamba');
  const [newEventClient, setNewEventClient] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');

  // Feedback toast
  const [portalToast, setPortalToast] = useState<string | null>(null);
  const [oaaUpgradeInput, setOaaUpgradeInput] = useState(currentUser?.oaaNumber || '4892/OAA');

  if (!isOpen) return null;

  // 1. Unauthenticated Guard
  if (!isLoggedIn || !currentUser) {
    const demoLawyer = DEMO_ACCOUNTS.find((d) => d.user.role === 'Advogado / Jurista');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px] text-amber-400">gavel</span>
              </div>
              <div>
                <h2 className="text-base font-bold font-headline text-white">Painel do Advogado & Escritório</h2>
                <p className="text-xs text-slate-300">Acesso Restrito à Carreira Jurídica (OAA)</p>
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
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <span className="material-symbols-outlined text-[30px]">shield_lock</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Início de Sessão Profissional Necessário</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Por motivos de confidencialidade deontológica e protecção dos autos processuais de clientes, o Painel Profissional é exclusivo para Advogados, Advogados Estagiários e Sociedades de Advogados inscritas na OAA.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth?.('login', 'Inicie sessão com a sua conta de Advogado ou Sociedade de Advogados da OAA.');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">login</span>
                <span>Entrar como Advogado</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLawyerRegistration?.();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
                <span>Cadastrar na OAA</span>
              </button>
            </div>

            {/* Quick Demo Lawyer Login */}
            {demoLawyer && (
              <div className="pt-4 border-t border-slate-100 text-left">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Acesso rápido de teste com perfil profissional:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onLogin?.(demoLawyer.user);
                  }}
                  className="w-full p-3 rounded-xl border border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-900 font-bold flex items-center justify-center text-xs">
                      OAA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-950">
                        Entrar como {demoLawyer.label}
                      </div>
                      <div className="text-[10px] text-amber-800 font-mono">{demoLawyer.badge} • Sociedade de Advogados</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-amber-700 group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Attribution Guard (Role-based access control)
  const isLawyer = currentUser.role === 'Advogado / Jurista' || currentUser.isRegisteredLawyer === true;
  if (!isLawyer) {
    const demoLawyer = DEMO_ACCOUNTS.find((d) => d.user.role === 'Advogado / Jurista');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px] text-amber-400">policy</span>
              </div>
              <div>
                <h2 className="text-base font-bold font-headline text-white">Controlo de Atribuições</h2>
                <p className="text-xs text-slate-300">Acesso Restrito à Ordem dos Advogados (OAA)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <span className="material-symbols-outlined text-[22px] text-amber-700 shrink-0 mt-0.5">warning</span>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-amber-950">
                  Atribuição Actual: <span className="underline">{currentUser.role}</span>
                </p>
                <p className="text-amber-900/90 leading-relaxed text-[11px]">
                  A sua conta está autenticada como <strong>{currentUser.name}</strong> ({currentUser.email}). O Painel do Advogado & Escritório é de acesso reservado a profissionais forenses com cédula profissional da Ordem dos Advogados de Angola (OAA).
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Opções disponíveis conforme as suas atribuições:
              </p>

              {/* Option A: Fast-switch to lawyer demo account */}
              {demoLawyer && (
                <button
                  type="button"
                  onClick={() => {
                    onLogin?.(demoLawyer.user);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/50 text-left transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[20px] text-amber-600">switch_account</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                        Alternar para Conta de Advogado
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Aceder como {demoLawyer.label} ({demoLawyer.badge})
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-amber-700">
                    arrow_forward
                  </span>
                </button>
              )}

              {/* Option B: Upgrade in-place to Lawyer with OAA registration */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-700">verified_user</span>
                  <span className="text-xs font-bold text-slate-800">
                    É Advogado ou Jurista? Valide a sua Cédula OAA
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Actualize a sua atribuição de conta para desbloquear a gestão de solicitações, processos e agenda.
                </p>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={oaaUpgradeInput}
                    onChange={(e) => setOaaUpgradeInput(e.target.value)}
                    placeholder="Ex: 4892/OAA"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!oaaUpgradeInput.trim()) return;
                      onUpgradeToLawyer?.(oaaUpgradeInput.trim());
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    Actualizar Atribuição
                  </button>
                </div>
              </div>

              {/* Option C: Return to User Dashboard */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToUserDashboard?.();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-emerald-700">space_dashboard</span>
                <span>Ir para o Meu Painel do Utente (Documentos e Consultas)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentLawyer = lawyers.find((l) => l.id === activeLawyerId) || lawyers[0];
  const isFirm = currentLawyer?.entityType === 'Sociedade de Advogados / Escritório';

  const triggerToast = (msg: string) => {
    setPortalToast(msg);
    setTimeout(() => setPortalToast(null), 3000);
  };

  // Filter requests for current lawyer
  const lawyerRequests = requests.filter(
    (r) => r.lawyerId === currentLawyer?.id || r.lawyerName === currentLawyer?.name
  );

  const filteredRequests = lawyerRequests.filter((r) => {
    const matchesStatus = requestFilter === 'Todas' || r.status === requestFilter;
    const matchesSearch =
      r.clientName.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.subject.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.clientPhone.includes(requestSearch);
    return matchesStatus && matchesSearch;
  });

  // Filter schedule events for current lawyer
  const lawyerEvents = scheduleEvents.filter((ev) => ev.lawyerId === currentLawyer?.id);

  // Filter reviews for current lawyer
  const lawyerReviews = reviews.filter((rev) => rev.lawyerId === currentLawyer?.id);

  // Stats calculation
  const pendingCount = lawyerRequests.filter((r) => r.status === 'Pendente').length;
  const confirmedCount = lawyerRequests.filter((r) => r.status === 'Confirmada').length;
  const completedCount = lawyerRequests.filter((r) => r.status === 'Realizada').length;
  const totalCount = lawyerRequests.length;
  const resolutionRate = totalCount > 0 ? Math.round(((completedCount + confirmedCount) / totalCount) * 100) : 92;

  const handleConfirmAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingRequest) return;

    onUpdateRequestStatus(acceptingRequest.id, 'Confirmada', {
      scheduledDate: acceptDate,
      scheduledTime: acceptTime,
      estimatedFee: acceptFee,
      caseNotes: acceptNotes || acceptingRequest.caseNotes,
    });

    // Also auto-add to schedule events
    onAddScheduleEvent({
      lawyerId: currentLawyer.id,
      lawyerName: currentLawyer.name,
      title: `Consulta com ${acceptingRequest.clientName}`,
      type: 'Consulta Cliente',
      date: acceptDate,
      time: acceptTime,
      location: acceptingRequest.modality === 'Presencial' ? (currentLawyer.location || 'Escritório Central') : 'Sessão Online DirIA Meet',
      clientName: acceptingRequest.clientName,
      status: 'Agendado',
      notes: acceptingRequest.subject,
    });

    triggerToast(`Consulta com ${acceptingRequest.clientName} confirmada para ${acceptDate} às ${acceptTime}!`);
    setAcceptingRequest(null);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;

    onUpdateRequestStatus(rejectingRequest.id, 'Recusada', {
      rejectReason: rejectReason || 'Incompatibilidade de agenda',
    });

    triggerToast(`Solicitação de ${rejectingRequest.clientName} declinada com formalismo.`);
    setRejectingRequest(null);
  };

  const handleSaveCaseNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotesRequest) return;

    onUpdateRequestStatus(editingNotesRequest.id, editingNotesRequest.status, {
      caseNotes: caseNotesDraft,
    });

    triggerToast('Notas do caso actualizadas com sucesso.');
    setEditingNotesRequest(null);
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    onAddScheduleEvent({
      lawyerId: currentLawyer.id,
      lawyerName: currentLawyer.name,
      title: newEventTitle.trim(),
      type: newEventType,
      date: newEventDate,
      time: newEventTime,
      location: newEventLocation.trim() || 'Tribunal / Escritório',
      clientName: newEventClient.trim() || undefined,
      status: 'Agendado',
      notes: newEventNotes.trim() || undefined,
    });

    triggerToast(`Novo compromisso "${newEventTitle}" adicionado à agenda.`);
    setIsCreatingEvent(false);
    setNewEventTitle('');
    setNewEventNotes('');
    setNewEventClient('');
  };

  const handleExportPerformanceReport = () => {
    const reportText = `RELATÓRIO DE DESEMPENHO E CONSULTAS FORENSES
DIRIA ANGOLA • GESTÃO PROFISSIONAL DE ADVOCACIA
===================================================
Profissional / Sociedade: ${currentLawyer.name}
Cédula OAA: ${currentLawyer.oaaNumber} | Província: ${currentLawyer.province || 'Luanda'}
Especialidade: ${currentLawyer.specialty}
Data de Emissão: ${new Date().toLocaleDateString('pt-AO')}

1. RESUMO OPERACIONAL:
- Volume Total de Solicitações: ${totalCount}
- Consultas Confirmadas: ${confirmedCount}
- Consultas Realizadas: ${completedCount}
- Solicitações Pendentes: ${pendingCount}
- Taxa Global de Resolução / Conciliação: ${resolutionRate}%

2. ÍNDICE DE SATISFAÇÃO & AVALIAÇÕES (OAA):
- Classificação Média: ${currentLawyer.rating?.toFixed(1) || '4.9'} / 5.0 estrelas
- Número de Avaliações Auditadas: ${lawyerReviews.length || currentLawyer.reviewCount || 15}
- Clareza Jurídica Média: 4.9/5
- Pontualidade e Cumprimento de Prazos: 4.8/5
- Eficácia de Resolução: 4.9/5

3. PRÓXIMAS AUDIÊNCIAS E MEDIAÇÕES IGT:
${lawyerEvents.map((ev) => `- [${ev.date} ${ev.time}] ${ev.type}: ${ev.title} (${ev.location})`).join('\n')}

Documento gerado automaticamente para arquivo de gestão de escritórios da Ordem dos Advogados de Angola.`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_Consultas_${currentLawyer.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Relatório de consultas exportado com sucesso (.txt)!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 shadow-2xl w-full max-w-6xl h-full sm:h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-3 py-2.5 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">gavel</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-sm sm:text-lg font-bold font-headline text-white truncate">
                  Painel do Advogado
                </h2>
                <span className="px-1.5 sm:px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-amber-400 text-slate-950 truncate">
                  OAA Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block truncate">
                Solicitações de utentes, audiências, conciliações IGT e relatórios operacionais
              </p>
            </div>
          </div>

          {/* Active Lawyer / Firm Switcher & Utente Switch */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onSwitchToUserDashboard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToUserDashboard();
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-[11px] sm:text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shadow-2xs"
                title="Alternar para o Painel do Utente (meus documentos e consultas)"
              >
                <span className="material-symbols-outlined text-[15px]">space_dashboard</span>
                <span className="hidden md:inline">Painel do Utente</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-xl px-2 py-1 text-xs">
              <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-amber-400">shield_person</span>
              <span className="text-slate-400 hidden lg:inline">Carteira:</span>
              <select
                value={activeLawyerId}
                onChange={(e) => setActiveLawyerId(e.target.value)}
                className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer max-w-[110px] sm:max-w-[170px] truncate"
              >
                {lawyers.map((l) => (
                  <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                    {l.name} ({l.entityType === 'Sociedade de Advogados / Escritório' ? 'Sociedade' : `OAA #${l.oaaNumber}`})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar Painel"
            >
              <span className="material-symbols-outlined text-[19px] sm:text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Toast alert inside modal */}
        {portalToast && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{portalToast}</span>
            </div>
            <button onClick={() => setPortalToast(null)} className="text-white hover:text-emerald-200 cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Tabs Bar */}
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
            onClick={() => setActiveTab('requests')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'requests'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[18px]">inbox</span>
            <span className="hidden sm:inline">Solicitações de Consulta</span>
            <span className="sm:hidden">Solicitações</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[18px]">calendar_month</span>
            <span className="hidden sm:inline">Agenda Forense & IGT</span>
            <span className="sm:hidden">Agenda</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
              {lawyerEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] sm:text-[18px]">analytics</span>
            <span className="hidden sm:inline">Relatórios & Resolução</span>
            <span className="sm:hidden">Relatórios</span>
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
            <span className="hidden sm:inline">Avaliações dos Utentes</span>
            <span className="sm:hidden">Avaliações</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-100 text-amber-900 font-semibold">
              {currentLawyer.rating?.toFixed(1) || '4.9'} ★
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3 sm:p-6 custom-scroll">
          {/* 1. VISÃO GERAL TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Lawyer Identity Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={currentLawyer.photoUrl}
                    alt={currentLawyer.name}
                    className={`w-16 h-16 object-cover border border-slate-200 shrink-0 ${
                      isFirm ? 'rounded-2xl' : 'rounded-full'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold font-headline text-slate-900">
                        {currentLawyer.name}
                      </h3>
                      {currentLawyer.verifiedOaa && (
                        <span className="flex items-center text-emerald-700 text-xs font-semibold gap-0.5">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          Inscrição OAA Activa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {currentLawyer.entityType || 'Advogado Singular'} • Cédula OAA #{currentLawyer.oaaNumber} • {currentLawyer.location}
                    </p>
                    <p className="text-xs text-emerald-800 font-medium mt-1">
                      Especialidade principal: {currentLawyer.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">mark_email_unread</span>
                    <span>Ver Solicitações ({pendingCount})</span>
                  </button>

                  <button
                    onClick={() => setIsCreatingEvent(true)}
                    className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Novo Compromisso</span>
                  </button>
                </div>
              </div>

              {/* Four Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Solicitações Pendentes</span>
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-headline text-slate-900 tabular-nums">
                    {pendingCount}
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium mt-1">
                    Requerem validação ou resposta
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Consultas Atendidas</span>
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-headline text-slate-900 tabular-nums">
                    {completedCount + confirmedCount}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    No histórico da plataforma
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Taxa de Resolução</span>
                    <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">balance</span>
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-headline text-slate-900 tabular-nums">
                    {resolutionRate}%
                  </div>
                  <p className="text-[11px] text-sky-700 font-medium mt-1">
                    Acordos e conciliações IGT
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Avaliação Média OAA</span>
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">star</span>
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-headline text-slate-900 tabular-nums flex items-baseline gap-1">
                    <span>{currentLawyer.rating?.toFixed(1) || '4.9'}</span>
                    <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {lawyerReviews.length || currentLawyer.reviewCount || 15} opiniões auditadas
                  </p>
                </div>
              </div>

              {/* Two Columns: Recent Urgent Requests & Upcoming Agenda */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Pending Requests Column */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-700 text-[20px]">mark_email_unread</span>
                      <h4 className="text-sm font-semibold text-slate-900 font-headline">
                        Solicitações Recentes de Cidadãos
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                    >
                      Todas ({lawyerRequests.length})
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {lawyerRequests.slice(0, 3).map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/70 space-y-2 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{req.clientName}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            req.status === 'Pendente'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'Confirmada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {req.subject}
                        </p>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-mono">{req.clientPhone}</span>
                          <div className="flex items-center gap-1.5">
                            {req.status === 'Pendente' && (
                              <button
                                onClick={() => setAcceptingRequest(req)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors cursor-pointer"
                              >
                                Aceitar
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingNotesRequest(req);
                                setCaseNotesDraft(req.caseNotes || '');
                              }}
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              Notas
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {lawyerRequests.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400">
                        Nenhuma solicitação registada até ao momento.
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Schedule Column */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-700 text-[20px]">event_upcoming</span>
                      <h4 className="text-sm font-semibold text-slate-900 font-headline">
                        Próximos Compromissos & Audiências
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                    >
                      Ver Agenda Completa
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {lawyerEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                            {ev.type}
                          </span>
                          <span className="text-xs font-mono font-medium text-slate-900">
                            {ev.date} às {ev.time}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {ev.title}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          Local: {ev.location}
                        </p>
                      </div>
                    ))}

                    {lawyerEvents.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400">
                        Nenhum evento agendado para os próximos dias.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SOLICITAÇÕES DE CONSULTA TAB */}
          {activeTab === 'requests' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              {/* Filter bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="Pesquisar por nome do utente, contacto ou matéria do conflito..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll w-full sm:w-auto">
                  {(['Todas', 'Pendente', 'Confirmada', 'Realizada', 'Recusada'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setRequestFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        requestFilter === st
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Request Cards List */}
              <div className="space-y-3">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{req.clientName}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            req.status === 'Pendente'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : req.status === 'Confirmada'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : req.status === 'Realizada'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {req.status}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Recebido: {req.createdAt}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">call</span>
                            <a href={`tel:${req.clientPhone}`} className="hover:underline font-mono">
                              {req.clientPhone}
                            </a>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                            Data pretendida: {req.preferredDate}
                          </span>
                          <span>•</span>
                          <span>Modalidade: {req.modality}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {req.status === 'Pendente' && (
                          <>
                            <button
                              onClick={() => {
                                setAcceptingRequest(req);
                                setAcceptDate(req.preferredDate !== 'A combinar' ? req.preferredDate : '2026-10-22');
                              }}
                              className="h-8 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              <span>Aceitar</span>
                            </button>

                            <button
                              onClick={() => setRejectingRequest(req)}
                              className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                              <span>Recusar</span>
                            </button>
                          </>
                        )}

                        {req.status === 'Confirmada' && (
                          <button
                            onClick={() => {
                              onUpdateRequestStatus(req.id, 'Realizada');
                              triggerToast(`Consulta de ${req.clientName} marcada como realizada.`);
                            }}
                            className="h-8 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">task_alt</span>
                            <span>Marcar como Realizada</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingNotesRequest(req);
                            setCaseNotesDraft(req.caseNotes || '');
                          }}
                          className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="Adicionar ou editar notas confidenciais do caso"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit_note</span>
                          <span>Notas</span>
                        </button>
                      </div>
                    </div>

                    {/* Case subject description */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs leading-relaxed text-slate-700">
                      <strong className="text-slate-900 block mb-0.5">Assunto Exposto pelo Utente:</strong>
                      {req.subject}
                    </div>

                    {/* Confirmed schedule details if applicable */}
                    {req.scheduledDate && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200/70 rounded-xl text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px] text-emerald-700">event_available</span>
                          <span>
                            Agendado para <strong>{req.scheduledDate}</strong> às <strong>{req.scheduledTime || '10:00'}</strong> ({req.modality})
                          </span>
                        </div>
                        {req.estimatedFee && (
                          <span className="font-mono text-emerald-800 font-semibold">
                            Honorários Acordados: {req.estimatedFee}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Case notes if any */}
                    {req.caseNotes && (
                      <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">lock</span>
                        <div>
                          <strong className="font-semibold">Notas do Advogado (Confidencial):</strong> {req.caseNotes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredRequests.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                    <p className="text-sm">Nenhuma solicitação encontrada com os filtros actuais.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. AGENDA FORENSE TAB */}
          {activeTab === 'schedule' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-900">
                    Agenda Forense, IGT & Sessões de Mediação
                  </h3>
                  <p className="text-xs text-slate-500">
                    Audiências judiciais, conciliações prévias e consultas jurídicas presenciais ou virtuais
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingEvent(true)}
                  className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Novo Compromisso</span>
                </button>
              </div>

              {/* Event Cards */}
              <div className="space-y-3">
                {lawyerEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                            ev.type === 'Mediação IGT'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : ev.type === 'Audiência Judicial'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {ev.type}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {ev.date} às {ev.time}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            ev.status === 'Agendado'
                              ? 'bg-slate-100 text-slate-700'
                              : ev.status === 'Realizado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ev.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold font-headline text-slate-900">
                          {ev.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {ev.status === 'Agendado' && (
                          <button
                            onClick={() => {
                              onUpdateScheduleEventStatus(ev.id, 'Realizado');
                              triggerToast('Compromisso marcado como realizado.');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors cursor-pointer"
                          >
                            Concluído
                          </button>
                        )}
                        {ev.status === 'Agendado' && (
                          <button
                            onClick={() => {
                              onUpdateScheduleEventStatus(ev.id, 'Adiado');
                              triggerToast('Compromisso adiado.');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Adiar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 pt-1">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                        {ev.location}
                      </span>
                      {ev.clientName && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500">
                            Mandante: <strong>{ev.clientName}</strong>
                          </span>
                        </>
                      )}
                    </div>

                    {ev.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        {ev.notes}
                      </p>
                    )}
                  </div>
                ))}

                {lawyerEvents.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">calendar_month</span>
                    <p className="text-sm">Nenhum compromisso registado na agenda.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. RELATÓRIO DE CONSULTAS & RESOLUÇÃO TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold font-headline text-slate-900">
                    Relatório Analítico de Consultas & Eficácia Forense
                  </h3>
                  <p className="text-xs text-slate-500">
                    Métricas consolidadas de resolução de litígios, volume de mandatos e retorno de utentes em Angola
                  </p>
                </div>

                <button
                  onClick={handleExportPerformanceReport}
                  className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Exportar Relatório (.txt)</span>
                </button>
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Resolution and Conciliation Box */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold font-headline text-slate-900">
                      Taxa de Resolução & Conciliação
                    </h4>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {resolutionRate}% de Êxito
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Acordos Extrajudiciais & Mediação IGT</span>
                        <span className="font-semibold font-mono">68%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Sentenças Favoráveis no Tribunal de Comarca</span>
                        <span className="font-semibold font-mono">26%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: '26%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Processos em Negociação / Pendentes</span>
                        <span className="font-semibold font-mono">6%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: '6%' }}></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                    O recurso prévio à sala de conciliação da IGT tem reduzido o tempo médio de resolução de 18 meses (via judicial) para 14 dias úteis.
                  </p>
                </div>

                {/* Distribution by Legal Field */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                  <h4 className="text-sm font-bold font-headline text-slate-900">
                    Distribuição das Consultas por Área
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Direito Laboral & Segurança Social (Lei 12/23)</span>
                        <span className="font-semibold font-mono">48%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '48%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Direito Comercial, Sociedades & M&A</span>
                        <span className="font-semibold font-mono">28%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Família, Sucessões & Menores</span>
                        <span className="font-semibold font-mono">14%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '14%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Direito Imobiliário & Terras</span>
                        <span className="font-semibold font-mono">10%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-700 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                    Área com maior procura nos últimos 30 dias: Cessação contratual e quitação de indemnizações por antiguidade.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. AVALIAÇÕES RECEBIDAS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-900">
                    Avaliações de Clientes & Utentes Verificados
                  </h3>
                  <p className="text-xs text-slate-500">
                    Feedback directo emitido por cidadãos e empresas após consultas ou patrocínio judiciário
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  <span>{currentLawyer.rating?.toFixed(1) || '4.9'} / 5.0</span>
                </div>
              </div>

              <div className="space-y-3">
                {lawyerReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{rev.authorName}</span>
                        {rev.authorRole && (
                          <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                            • {rev.authorRole}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
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

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{rev.comment}"
                    </p>

                    {rev.criteria && (
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono pt-1">
                        <span>Clareza: <strong>{rev.criteria.clarity}/5</strong></span>
                        <span>Agilidade: <strong>{rev.criteria.efficiency}/5</strong></span>
                        <span>Resolução: <strong>{rev.criteria.resolution}/5</strong></span>
                      </div>
                    )}
                  </div>
                ))}

                {lawyerReviews.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-amber-300">star</span>
                    <p className="text-sm">Ainda não foram registadas avaliações públicas para este profissional.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL: ACEITAR SOLICITAÇÃO COM HORÁRIO E SALA */}
        {acceptingRequest && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-headline text-slate-900">
                      Confirmar Consulta com {acceptingRequest.clientName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Defina a data final, hora e condições do atendimento
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setAcceptingRequest(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleConfirmAccept} className="space-y-3.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="font-semibold text-slate-800">Assunto:</div>
                  <div className="text-slate-600 line-clamp-2">{acceptingRequest.subject}</div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Contacto: {acceptingRequest.clientPhone} • Modalidade: {acceptingRequest.modality}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Data da Consulta *:
                    </label>
                    <input
                      type="date"
                      required
                      value={acceptDate}
                      onChange={(e) => setAcceptDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Horário *:
                    </label>
                    <input
                      type="time"
                      required
                      value={acceptTime}
                      onChange={(e) => setAcceptTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Honorários Estimados / Enquadramento:
                  </label>
                  <input
                    type="text"
                    value={acceptFee}
                    onChange={(e) => setAcceptFee(e.target.value)}
                    placeholder="Ex: Kz 150.000,00 ou Isento (Primeira Sessão de Orientação)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Notas Internas do Escritório (Opcional):
                  </label>
                  <textarea
                    rows={2}
                    value={acceptNotes}
                    onChange={(e) => setAcceptNotes(e.target.value)}
                    placeholder="Documentos a solicitar ao mandante, cálculo LGT prévio..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAcceptingRequest(null)}
                    className="flex-1 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Confirmar & Adicionar à Agenda
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RECUSAR SOLICITAÇÃO */}
        {rejectingRequest && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[20px]">cancel</span>
                  <h3 className="text-sm font-bold font-headline text-slate-900">
                    Recusar Solicitação de Consulta
                  </h3>
                </div>

                <button
                  onClick={() => setRejectingRequest(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-3.5 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Indique o motivo formal de recusa do pedido de <strong>{rejectingRequest.clientName}</strong>:
                </p>

                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Conflito de interesses, ausência de disponibilidade nos próximos 30 dias..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white resize-none"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingRequest(null)}
                    className="flex-1 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Confirmar Recusa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: NOTAS CONFIDENCIAIS DO CASO */}
        {editingNotesRequest && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[20px]">edit_note</span>
                  <h3 className="text-sm font-bold font-headline text-slate-900">
                    Notas Confidenciais do Caso • {editingNotesRequest.clientName}
                  </h3>
                </div>

                <button
                  onClick={() => setEditingNotesRequest(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveCaseNotes} className="space-y-3.5 text-xs">
                <textarea
                  rows={6}
                  value={caseNotesDraft}
                  onChange={(e) => setCaseNotesDraft(e.target.value)}
                  placeholder="Escreva anotações internas: fundamentação jurídica, artigos aplicáveis da LGT ou CPC, documentos em posse do cliente, valores em disputa..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white resize-none leading-relaxed"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingNotesRequest(null)}
                    className="flex-1 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Guardar Notas
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CRIAR NOVO COMPROMISSO NA AGENDA */}
        {isCreatingEvent && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-800 text-[20px]">add_circle</span>
                  <h3 className="text-sm font-bold font-headline text-slate-900">
                    Adicionar Compromisso à Agenda Forense
                  </h3>
                </div>

                <button
                  onClick={() => setIsCreatingEvent(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateEventSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Título do Compromisso *:
                  </label>
                  <input
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Ex: Audiência de Julgamento - Sala de Trabalho ou Sessão IGT"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Tipo de Diligência *:
                    </label>
                    <select
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value as ScheduleEventType)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    >
                      <option value="Mediação IGT">Mediação IGT</option>
                      <option value="Audiência Judicial">Audiência Judicial</option>
                      <option value="Consulta Cliente">Consulta Cliente</option>
                      <option value="Diligência Notarial / Registo">Diligência Notarial / Registo</option>
                      <option value="Reunião de Sócios">Reunião de Sócios</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Mandante / Processo:
                    </label>
                    <input
                      type="text"
                      value={newEventClient}
                      onChange={(e) => setNewEventClient(e.target.value)}
                      placeholder="Ex: Proc. n.º 230/26 ou Nome"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Data *:
                    </label>
                    <input
                      type="date"
                      required
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Hora *:
                    </label>
                    <input
                      type="time"
                      required
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Local / Sala:
                  </label>
                  <input
                    type="text"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="Ex: Tribunal de Comarca de Luanda, Palácio D. Ana Joaquina"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Anotações da Diligência:
                  </label>
                  <textarea
                    rows={2}
                    value={newEventNotes}
                    onChange={(e) => setNewEventNotes(e.target.value)}
                    placeholder="Documentos a levar, testemunhas, procuração forense..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingEvent(false)}
                    className="flex-1 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Guardar Compromisso
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
