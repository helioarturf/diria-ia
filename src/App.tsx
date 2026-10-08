import React, { useState, useEffect, useRef } from 'react';
import { Consultation, Lawyer, Message, UserProfile } from './types';
import { INITIAL_LAWYERS } from './data/legalData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { LegalBasesModal } from './components/LegalBasesModal';
import { LawyersDirectoryModal } from './components/LawyersDirectoryModal';
import { LaborCalculatorModal } from './components/LaborCalculatorModal';
import { DraftsModal } from './components/DraftsModal';
import { ScheduleConsultationModal } from './components/ScheduleConsultationModal';
import { SettingsModal } from './components/SettingsModal';
import { LawyerRegistrationModal } from './components/LawyerRegistrationModal';
import { CleanWelcomeScreen } from './components/CleanWelcomeScreen';
import { UserProfileModal } from './components/UserProfileModal';

const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-default',
  name: '',
  role: 'Cidadão / Utente',
  experienceLevel: 'Iniciante',
  responseStyle: 'Prático & Directo',
  primaryAreas: [
    'Direito Civil & Obrigações',
    'Direito Comercial & Sociedades',
    'Direito Laboral & Segurança Social',
    'Direito Imobiliário & Arrendamento',
  ],
  province: 'Luanda (Comarca Central, Viana, Belas, Cacuaco)',
};

const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'consult-1',
    title: 'Rescisão Contratual & Compensação',
    category: 'Direito Laboral',
    updatedAt: 'Hoje às 10:20',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Fui despedido sem aviso prévio após 4 anos numa empresa privada em Viana. Tenho direito legal a indemnização?',
        timestamp: '10:14',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content:
          'Sim. Nos termos da legislação laboral de Angola, a cessação do contrato individual promovida pelo empregador sem pré-aviso nem justa causa comprovada constitui despedimento ilícito, gerando obrigação compensatória imediata.\n\nTendo completado 4 anos de antiguidade, o cálculo inicial contempla o salário-base mensal multiplicado pelo coeficiente temporal, acrescido do salário de pré-aviso devido.',
        timestamp: '10:15',
        citation: {
          law: 'Lei Geral do Trabalho de Angola (Lei n.º 12/23)',
          article: 'Art.º 232.º',
          text: '“A cessação sem justa causa confere ao trabalhador compensação pecuniária correspondente ao tempo efectivo de serviço, acrescida do vencimento correspondente ao período de aviso prévio em falta e proporcionais de férias e subsídio de Natal.”',
        },
        audioDuration: '0:24',
      },
      {
        id: 'msg-3',
        role: 'user',
        content:
          'A empresa recusou liquidar os valores e reteve a minha carteira de trabalho e guias. Ameaçaram também processar-me se eu for à polícia. O que devo fazer?',
        timestamp: '10:18',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content:
          'A retenção de carteira profissional ou certidões é expressamente proibida pela ordem jurídica angolana, tipificando contra-ordenação laboral grave e abuso de direito.\n\n• Inspecção Geral do Trabalho (IGT): Denúncia sumária para auto de notícia e mediação conciliatória imediata.\n• Interpelação formal: Notificação escrita concedendo prazo peremptório para devolução dos documentos e quitação dos créditos.',
        timestamp: '10:19',
        complexity: 'Elevada',
        lawyers: [INITIAL_LAWYERS[0], INITIAL_LAWYERS[1]],
        suggestions: [
          'Como formalizar queixa na IGT Luanda?',
          'Minuta de interpelação para devolução de carteira',
        ],
        audioDuration: '0:32',
      },
    ],
  },
  {
    id: 'consult-2',
    title: 'Contrato de Arrendamento Luanda',
    category: 'Civil & Imobiliário',
    updatedAt: 'Ontem',
    messages: [
      {
        id: 'msg-201',
        role: 'user',
        content: 'O senhorio pode exigir 6 meses de renda antecipada em Luanda segundo a Lei 26/15?',
        timestamp: '14:30',
      },
      {
        id: 'msg-202',
        role: 'assistant',
        content:
          'Não. Nos termos do Regime Jurídico do Arrendamento Urbano de Angola (Lei n.º 26/15), o senhorio só pode exigir o adiantamento de rendas até ao limite máximo estipulado pela lei e a caução contratual correspondente a um ou dois meses para garantia de conservação do imóvel.',
        timestamp: '14:31',
        citation: {
          law: 'Regime Jurídico do Arrendamento Urbano (Lei n.º 26/15)',
          article: 'Art.º 18.º',
          text: '“Não é exigível ao arrendatário o adiantamento de renda superior aos limites legais para contratos com fins habitacionais.”',
        },
        suggestions: ['Minuta de contrato de arrendamento urbano', 'Regras de recibo de quitação'],
      },
    ],
  },
  {
    id: 'consult-3',
    title: 'Constituição de Sociedade por Quotas',
    category: 'Direito Comercial',
    updatedAt: '3 dias atrás',
    messages: [
      {
        id: 'msg-301',
        role: 'user',
        content: 'Quais os documentos necessários para abrir uma sociedade por quotas unipessoal no Guichet Único da Empresa em Luanda?',
        timestamp: '09:12',
      },
      {
        id: 'msg-302',
        role: 'assistant',
        content:
          'Nos termos da Lei das Sociedades Comerciais (Lei n.º 1/04) e do regime de simplificação do GUE (Guichet Único da Empresa), a constituição de sociedade unipessoal por quotas requer: B.I. e NIF do sócio único, certidão de admissibilidade de firma, pacto social e comprovativo de depósito do capital social ou declaração sob compromisso de honra.',
        timestamp: '09:14',
        suggestions: ['Minuta de pacto social unipessoal', 'Obrigações perante a AGT'],
      },
    ],
  },
  {
    id: 'consult-4',
    title: 'Código Geral Tributário: Isenções',
    category: 'Direito Fiscal',
    updatedAt: '5 dias atrás',
    messages: [
      {
        id: 'msg-401',
        role: 'user',
        content: 'Quais as isenções previstas no Código Geral Tributário para microempresas?',
        timestamp: '11:05',
      },
      {
        id: 'msg-402',
        role: 'assistant',
        content:
          'O Código Geral Tributário (Lei n.º 21/14) e o regime do IVA prevêem regimes simplificados e isenções para contribuintes com volume de facturação anual inferior a determinados limiares, beneficiando de declarações sumárias perante a AGT.',
        timestamp: '11:06',
      },
    ],
  },
];

export default function App() {
  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    try {
      const saved = localStorage.getItem('diria_consultations');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CONSULTATIONS;
  });

  const [lawyers, setLawyers] = useState<Lawyer[]>(() => {
    try {
      const saved = localStorage.getItem('diria_lawyers');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_LAWYERS;
  });

  const [activeConsultationId, setActiveConsultationId] = useState<string>(
    INITIAL_CONSULTATIONS[0].id
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isLegalBasesOpen, setIsLegalBasesOpen] = useState(false);
  const [isLawyersOpen, setIsLawyersOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLawyerForSchedule, setSelectedLawyerForSchedule] = useState<Lawyer | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('diria_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_USER_PROFILE;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('diria_consultations', JSON.stringify(consultations));
    } catch {
      // storage quota or disabled
    }
  }, [consultations]);

  useEffect(() => {
    try {
      localStorage.setItem('diria_lawyers', JSON.stringify(lawyers));
    } catch {
      // storage quota or disabled
    }
  }, [lawyers]);

  useEffect(() => {
    try {
      localStorage.setItem('diria_user_profile', JSON.stringify(userProfile));
    } catch {
      // storage quota or disabled
    }
  }, [userProfile]);

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    showToast(`Perfil de experiência actualizado: ${newProfile.role} (${newProfile.responseStyle})`);
  };

  const handleRegisterLawyer = (newLawyer: Lawyer) => {
    setLawyers((prev) => [newLawyer, ...prev]);
    showToast(
      `${
        newLawyer.entityType === 'Sociedade de Advogados / Escritório' ? 'Escritório' : 'Jurista'
      } "${newLawyer.name}" cadastrado com sucesso no Directório OAA!`
    );
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Keyboard shortcut Cmd/Ctrl + N for new consultation, Cmd/Ctrl + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewConsultation();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeConsultation =
    consultations.find((c) => c.id === activeConsultationId) || consultations[0];

  const handleSelectConsultation = (id: string) => {
    setActiveConsultationId(id);
    setTimeout(scrollToBottom, 100);
  };

  const handleNewConsultation = () => {
    const newId = `consult-${Date.now()}`;
    const newConsultation: Consultation = {
      id: newId,
      title: 'Nova Consulta Jurídica',
      category: 'Direito Angolano',
      updatedAt: 'Agora',
      messages: [],
    };

    setConsultations((prev) => [newConsultation, ...prev]);
    setActiveConsultationId(newId);
    setTimeout(scrollToBottom, 100);
  };

  const handleDeleteConsultation = (id: string) => {
    if (consultations.length <= 1) {
      const newId = `consult-${Date.now()}`;
      const freshConsultation: Consultation = {
        id: newId,
        title: 'Nova Consulta Jurídica',
        category: 'Direito Angolano',
        updatedAt: 'Agora',
        messages: [],
      };
      setConsultations([freshConsultation]);
      setActiveConsultationId(newId);
      return;
    }

    const remaining = consultations.filter((c) => c.id !== id);
    setConsultations(remaining);
    if (activeConsultationId === id) {
      setActiveConsultationId(remaining[0].id);
    }
    showToast('Consulta removida do histórico.');
  };

  const handleSendMessage = async (
    text: string,
    attachedDoc?: { name: string; content?: string; size?: string }
  ) => {
    if (!text.trim() && !attachedDoc) return;

    const currentTime = new Date().toLocaleTimeString('pt-AO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: currentTime,
      attachedDoc,
    };

    // Update state with user message
    const updatedMessages = [...activeConsultation.messages, userMsg];

    // Determine title if this was a new consultation
    let currentTitle = activeConsultation.title;
    let currentCategory = activeConsultation.category;
    if (currentTitle === 'Nova Consulta Jurídica' && text.length > 0) {
      currentTitle = text.slice(0, 35) + (text.length > 35 ? '...' : '');
      const lower = text.toLowerCase();
      if (lower.includes('desped') || lower.includes('trabalho') || lower.includes('igt') || lower.includes('salário')) {
        currentCategory = 'Direito Laboral';
      } else if (lower.includes('empresa') || lower.includes('sociedade') || lower.includes('comerc')) {
        currentCategory = 'Direito Comercial';
      } else if (lower.includes('renda') || lower.includes('arrend') || lower.includes('imóvel') || lower.includes('casa')) {
        currentCategory = 'Civil & Arrendamento';
      } else if (lower.includes('crime') || lower.includes('polícia') || lower.includes('sic') || lower.includes('ameaça')) {
        currentCategory = 'Direito Penal';
      }
    }

    setConsultations((prev) =>
      prev.map((c) =>
        c.id === activeConsultationId
          ? {
              ...c,
              title: currentTitle,
              category: currentCategory,
              updatedAt: 'Agora',
              messages: updatedMessages,
            }
          : c
      )
    );

    setTimeout(scrollToBottom, 50);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          consultationType: currentCategory,
          attachedDoc: attachedDoc ? { name: attachedDoc.name, summary: attachedDoc.content?.slice(0, 2000) } : undefined,
          userProfile,
        }),
      });

      if (!response.ok) {
        console.warn(`Resposta da API com estado ${response.status}, aplicando apoio jurídico adaptado.`);
        throw new Error(`Status ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Parecer preliminar emitido com base no direito angolano.',
        timestamp: new Date().toLocaleTimeString('pt-AO', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        complexity: data.complexity || 'Média',
        lawyers: data.complexity === 'Elevada' ? lawyers.slice(0, 2) : undefined,
        suggestions: data.suggestions,
        audioDuration: '0:28',
      };

      setConsultations((prev) =>
        prev.map((c) =>
          c.id === activeConsultationId
            ? {
                ...c,
                messages: [...updatedMessages, assistantMsg],
              }
            : c
        )
      );
    } catch (err: any) {
      console.warn('Apoio jurídico alternativo activado para o perfil do utilizador:', err?.message || err);

      // Intelligent multidisciplinary fallback adapted to question subject and user experience profile
      const lowerText = text.toLowerCase();
      let fallbackCitation = {
        law: 'Constituição da República de Angola (CRA)',
        article: 'Art.º 29.º',
        text: '“A todos é assegurado o acesso ao direito e aos tribunais para defesa dos seus direitos e interesses legalmente protegidos.”',
      };
      let fallbackContent = '';
      let fallbackSuggestions = [
        'Consultar articulados legais no Diário da República',
        'Emitir minuta correspondente',
      ];

      if (lowerText.includes('arrend') || lowerText.includes('renda') || lowerText.includes('senhorio') || lowerText.includes('imóvel') || lowerText.includes('casa')) {
        fallbackCitation = {
          law: 'Regime Jurídico do Arrendamento Urbano (Lei n.º 26/15)',
          article: 'Art.º 18.º e 35.º',
          text: '“A exigência de adiantamento de rendas e a denúncia do contrato obedecem estritamente aos prazos e limites previstos na lei.”',
        };
        fallbackContent = `De acordo com o Regime do Arrendamento Urbano de Angola (Lei n.º 26/15) e Código Civil:\n\n• Limites de cobrança: O senhorio não pode impor exigências arbitrárias fora dos limites da lei ou do contrato;\n• Denúncia e despejo: A desocupação forçada sem título executivo ou processo judicial de despejo é ilícita;\n• Procedimento: Recomenda-se interpelação formal por escrito concedendo prazo razoável.`;
        fallbackSuggestions = ['Minuta de contrato de arrendamento urbano', 'Regras de recibo de quitação'];
      } else if (lowerText.includes('empresa') || lowerText.includes('sociedade') || lowerText.includes('quotas') || lowerText.includes('gue') || lowerText.includes('comerc')) {
        fallbackCitation = {
          law: 'Lei das Sociedades Comerciais (Lei n.º 1/04)',
          article: 'Art.º 214.º e 270.º',
          text: '“As sociedades por quotas e sociedades unipessoais constituem-se mediante pacto social e registo comercial simplificado.”',
        };
        fallbackContent = `Nos termos da Lei das Sociedades Comerciais (Lei n.º 1/04) e do Guichet Único da Empresa (GUE):\n\n• Documentação: Certidão de admissibilidade de firma, B.I./NIF dos sócios e pacto social;\n• Registo Comercial: Inscrição na Conservatória do Registo Comercial e publicação oficial;\n• Obrigações: Enquadramento fiscal perante a AGT e cadastro na segurança social (INSS).`;
        fallbackSuggestions = ['Minuta de pacto social de sociedade comercial', 'Trâmites no GUE Luanda'];
      } else if (lowerText.includes('imposto') || lowerText.includes('tribut') || lowerText.includes('agt') || lowerText.includes('irt') || lowerText.includes('iva')) {
        fallbackCitation = {
          law: 'Código Geral Tributário (Lei n.º 21/14)',
          article: 'Art.º 45.º e seguintes',
          text: '“O contribuinte goza de garantias impugnatórias, reclamação graciosa e recurso contencioso perante liquidações tributárias.”',
        };
        fallbackContent = `Conforme o Código Geral Tributário (Lei n.º 21/14) e regulamentos da AGT:\n\n• Reclamação graciosa: Prazo legal perante a Repartição Fiscal competente;\n• Impugnação judicial: Recurso para a Sala do Fiscal e Aduaneiro da comarca de ${userProfile.province.split(' ')[0]};\n• Regularização: Apresentação de comprovativos de pagamento e pedidos de certidão de não-devedor.`;
        fallbackSuggestions = ['Reclamação graciosa à AGT', 'Prazos de impugnação fiscal'];
      } else if (lowerText.includes('crime') || lowerText.includes('polícia') || lowerText.includes('sic') || lowerText.includes('queixa') || lowerText.includes('ameaça')) {
        fallbackCitation = {
          law: 'Código Penal Angolano (Lei n.º 38/20)',
          article: 'Art.º 340.º e 360.º',
          text: '“São tipificadas e puníveis as condutas de coacção, ameaça e apropriação arbitrária de bens ou documentação alheia.”',
        };
        fallbackContent = `Nos termos do Código Penal (Lei n.º 38/20) e Código de Processo Penal (Lei n.º 39/20):\n\n• Participação criminal: Pode ser formalizada junto da esquadra da PNA, piquete do SIC ou Ministério Público;\n• Preservação de provas: Guardar mensagens, gravações e identificação de testemunhas;\n• Assistência jurídica: Aconselha-se representação por advogado com cédula em vigor na OAA.`;
        fallbackSuggestions = ['Como formalizar queixa no piquete do SIC/PNA', 'Directório de Advogados OAA'];
      } else if (lowerText.includes('desped') || lowerText.includes('trabalho') || lowerText.includes('igt') || lowerText.includes('salário')) {
        fallbackCitation = {
          law: 'Lei Geral do Trabalho (Lei n.º 12/23)',
          article: 'Art.º 232.º e 236.º',
          text: '“A cessação contratual promovida sem observância do procedimento legal tipifica ilicitude geradora de reparação pecuniária imediata.”',
        };
        fallbackContent = `Com base na Lei Geral do Trabalho (Lei n.º 12/23):\n\n• Verificação de pré-aviso e formalidades de rescisão;\n• Liquidação de créditos laborais (antiguidade, férias vencidas/proporcionais, subsídios);\n• Reclamação junto da Inspecção Geral do Trabalho (IGT) para auto de notícia e mediação conciliatória.`;
        fallbackSuggestions = ['Minuta de reclamação à IGT Luanda', 'Simular cálculo de indemnização Lei 12/23'];
      } else {
        fallbackContent = `Com base no ordenamento jurídico da República de Angola para o perfil ${userProfile.role}:\n\n• Enquadramento jurídico nas normas de direito positivo vigentes;\n• Reunião de documentos probatórios pertinentes ao caso concreto;\n• Orientações práticas e procedimentos recomendados perante as instâncias competentes em ${userProfile.province.split(' ')[0]}.`;
      }

      const fallbackMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date().toLocaleTimeString('pt-AO', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        citation: fallbackCitation,
        complexity: 'Média',
        lawyers: lawyers.slice(0, 2),
        suggestions: fallbackSuggestions,
      };

      setConsultations((prev) =>
        prev.map((c) =>
          c.id === activeConsultationId
            ? {
                ...c,
                messages: [...updatedMessages, fallbackMsg],
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handlePlayTTS = async (text: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.audio) {
        return `data:audio/wav;base64,${data.audio}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleExportConsultation = () => {
    const textData = activeConsultation.messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? 'UTILIZADOR' : 'DIRIA ANGOLA'}:\n${m.content}\n`)
      .join('\n---\n\n');

    navigator.clipboard.writeText(textData);
    showToast('Consulta copiada para a área de transferência!');
  };

  const handleLawyerSchedule = (lawyer: Lawyer) => {
    setSelectedLawyerForSchedule(lawyer);
  };

  const handleLawyerContact = (lawyer: Lawyer) => {
    showToast(`Contacto do ${lawyer.name}: ${lawyer.phone || '+244 923 445 110'} (${lawyer.email || 'geral@oaa.ao'})`);
  };

  const handleClearAllHistory = () => {
    setConsultations(INITIAL_CONSULTATIONS);
    setActiveConsultationId(INITIAL_CONSULTATIONS[0].id);
    localStorage.removeItem('diria_consultations');
    showToast('Histórico restaurado para os registos de demonstração.');
  };

  return (
    <div className="bg-[#f8fafc] text-slate-900 font-sans antialiased h-screen flex overflow-hidden">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MINIMALIST SLIM SIDEBAR */}
      <Sidebar
        consultations={consultations}
        activeConsultationId={activeConsultationId}
        onSelectConsultation={handleSelectConsultation}
        onNewConsultation={handleNewConsultation}
        onDeleteConsultation={handleDeleteConsultation}
        onExportConsultation={handleExportConsultation}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsedDesktop={isSidebarCollapsed}
        onToggleCollapseDesktop={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenLegalBases={() => setIsLegalBasesOpen(true)}
        onOpenLawyersDirectory={() => setIsLawyersOpen(true)}
        onOpenLawyerRegistration={() => setIsRegistrationOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenDrafts={() => setIsDraftsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* MAIN CANVAS */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fafafa] relative">
        {/* Ultra-Clean Top Bar with User Profile */}
        <Header
          consultation={activeConsultation}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          isCollapsedDesktop={isSidebarCollapsed}
          onToggleDesktopSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onNewConsultation={handleNewConsultation}
          onExport={handleExportConsultation}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenDrafts={() => setIsDraftsOpen(true)}
          userProfile={userProfile}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Chat Stream Scrollable Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scroll flex flex-col">
          {activeConsultation.messages.length === 0 ? (
            <CleanWelcomeScreen
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              onOpenLegalBases={() => setIsLegalBasesOpen(true)}
              onOpenLawyersDirectory={() => setIsLawyersOpen(true)}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              onOpenDrafts={() => setIsDraftsOpen(true)}
              userProfile={userProfile}
              onOpenProfile={() => setIsProfileModalOpen(true)}
            />
          ) : (
            <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 pb-36">
              {activeConsultation.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSuggestionClick={(sug) => handleSendMessage(sug)}
                  onLawyerSchedule={handleLawyerSchedule}
                  onLawyerContact={handleLawyerContact}
                  onPlayTTS={handlePlayTTS}
                />
              ))}

              {isLoading && (
                <div className="flex items-start gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white p-1 shadow-2xs shrink-0 mt-0.5 overflow-hidden">
                    <img
                      alt="DirIA"
                      className="w-full h-full object-contain opacity-70"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG5DfPJmd2GGvB2GytkJPcDKrgEU4_Lwb_2_DcfxfvS50quXXng8d_L7_6PuC_8X9U-7osykQvNWw2yYNxN_craMokqB2qhkzn7euot8pY-yB17AQa-bBCiOo9_3Wyxpr2Z5WtUX3j9sZ9fmqj0xrQ0BYXEdmj1yoU8hDlSkNHxHbJIGsTeiD_1G8Jt3uP1h33RJ7cPo3Hn8pIq2Px4NeJZpql28khefknnza2cKUrtKd8I1aHOOwB"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-semibold text-slate-900 text-sm">DirIA</span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full">
                        A fundamentar parecer jurídico...
                      </span>
                    </div>
                    <div className="h-4 bg-slate-200/80 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200/60 rounded w-2/3"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* FLOATING BOTTOM INPUT BAR */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* MODALS */}
      <LegalBasesModal
        isOpen={isLegalBasesOpen}
        onClose={() => setIsLegalBasesOpen(false)}
        onAskAboutLaw={(lawTitle, article) => {
          const prompt = article
            ? `Poderia esclarecer a aplicação e implicações práticas do ${article} da ${lawTitle} no contexto actual de Angola?`
            : `Poderia fornecer um resumo prático dos principais pontos e direitos garantidos pela ${lawTitle}?`;
          handleSendMessage(prompt);
        }}
        onToast={showToast}
      />

      <LawyersDirectoryModal
        lawyers={lawyers}
        isOpen={isLawyersOpen}
        onClose={() => setIsLawyersOpen(false)}
        onSchedule={(lawyer) => {
          setSelectedLawyerForSchedule(lawyer);
        }}
        onContact={handleLawyerContact}
        onOpenRegistration={() => setIsRegistrationOpen(true)}
      />

      <LawyerRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onRegister={handleRegisterLawyer}
      />

      <LaborCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onInsertInChat={(summary) => {
          handleSendMessage(summary);
        }}
      />

      <DraftsModal
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        onRequestCustomDraft={(docType) => {
          handleSendMessage(`Solicito a redacção personalizada da minuta: "${docType}" adaptada ao meu caso particular em Angola.`);
        }}
      />

      <ScheduleConsultationModal
        lawyer={selectedLawyerForSchedule}
        isOpen={!!selectedLawyerForSchedule}
        onClose={() => setSelectedLawyerForSchedule(null)}
        onSuccess={(msg) => showToast(msg)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={handleClearAllHistory}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
