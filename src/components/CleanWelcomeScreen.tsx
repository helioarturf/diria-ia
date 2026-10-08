import React from 'react';
import { UserProfile } from '../types';

interface CleanWelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
  onOpenLegalBases: () => void;
  onOpenLawyersDirectory: () => void;
  onOpenCalculator: () => void;
  onOpenDrafts: () => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onOpenAuth?: (initialMode?: 'login' | 'register') => void;
  isLoggedIn?: boolean;
}

export const CleanWelcomeScreen: React.FC<CleanWelcomeScreenProps> = ({
  onSelectPrompt,
  onOpenLegalBases,
  onOpenLawyersDirectory,
  onOpenCalculator,
  onOpenDrafts,
  userProfile,
  onOpenProfile,
  onOpenAuth,
  isLoggedIn = false,
}) => {
  const getSuggestionsForProfile = () => {
    const role = userProfile?.role || 'Cidadão / Utente';

    if (role === 'Advogado / Jurista') {
      return [
        {
          icon: 'gavel',
          title: 'Excepção Dilatória & Foro no CPC',
          prompt: 'Como articular a excepção de incompetência relativa ou absoluta em acção cível perante a Sala do Cível do Tribunal de Comarca?',
          badge: 'Processo Civil',
        },
        {
          icon: 'balance',
          title: 'Deliberação Social & Lei 1/04',
          prompt: 'Quais os pressupostos materiais e prazo de caducidade para suspensão judicial de deliberações de assembleia geral sob a Lei das Sociedades Comerciais?',
          badge: 'Direito Comercial',
        },
        {
          icon: 'receipt_long',
          title: 'Contencioso Tributário & Código 21/14',
          prompt: 'Qual o regime de reclamação graciosa prévia e recurso contencioso perante liquidação oficiosa da AGT no Código Geral Tributário?',
          badge: 'Direito Fiscal',
        },
        {
          icon: 'security',
          title: 'Vícios do Processo Disciplinar (DP 214/23)',
          prompt: 'Quais as nulidades insupríveis na nota de culpa e procedimento disciplinar laboral à luz do Decreto Presidencial 214/23 e Lei 12/23?',
          badge: 'Contencioso Laboral',
        },
      ];
    }

    if (role === 'Empresário / Gestor de RH') {
      return [
        {
          icon: 'corporate_fare',
          title: 'Constituição de Sociedade no GUE',
          prompt: 'Quais os documentos e trâmites para registo célere de sociedade por quotas unipessoal no Guichet Único da Empresa em Luanda?',
          badge: 'Empresarial & GUE',
        },
        {
          icon: 'attach_money',
          title: 'Obrigações Fiscais AGT & IRT',
          prompt: 'Quais as regras de retenção na fonte do IRT e obrigações declarativas mensais para prestadores de serviços e empresas em Angola?',
          badge: 'Fiscal & Tributário',
        },
        {
          icon: 'store',
          title: 'Arrendamento Comercial & Lei 26/15',
          prompt: 'Quais as formalidades e limites legais para actualização de renda e denúncia de contrato de arrendamento para fins comerciais?',
          badge: 'Civil & Imobiliário',
        },
        {
          icon: 'handshake',
          title: 'Acordo de Revogação sem Litígio',
          prompt: 'Como estruturar um acordo mútuo de cessação contratual laboral com termo de quitação geral para mitigar contingências na Sala de Trabalho?',
          badge: 'Recursos Humanos',
        },
      ];
    }

    if (role === 'Estudante de Direito') {
      return [
        {
          icon: 'school',
          title: 'Fiscalização Constitucional na CRA',
          prompt: 'Como se articula o controlo concreto e abstracto de constitucionalidade pelo Tribunal Constitucional nos termos da CRA revista pela Lei 18/21?',
          badge: 'Constitucional',
        },
        {
          icon: 'menu_book',
          title: 'Responsabilidade Civil no Código Civil',
          prompt: 'Quais os pressupostos dogmáticos da responsabilidade civil extracontratual pelo facto ilícito segundo o artigo 483.º do Código Civil?',
          badge: 'Direito Civil',
        },
        {
          icon: 'policy',
          title: 'Direito de Queixa no CP e CPP (Lei 38/20)',
          prompt: 'Qual a distinção processual entre crimes públicos, semipúblicos e particulares quanto ao prazo de queixa no novo Código Penal Angolano?',
          badge: 'Penal & Processual',
        },
        {
          icon: 'history_edu',
          title: 'Evolução da Legislação Laboral Angolana',
          prompt: 'Quais as principais alterações substanciais introduzidas pela Lei n.º 12/23 face à anterior Lei 7/15 no regime de indemnizações e teletrabalho?',
          badge: 'Laboral Comparado',
        },
      ];
    }

    // Default: Cidadão / Utente
    return [
      {
        icon: 'calculate',
        title: 'Despedimento & Indemnização Devida',
        prompt: 'Fui despedido sem aviso prévio após 4 anos de serviço numa empresa privada. A que indemnização e direitos tenho direito legal?',
        badge: 'Direito do Trabalho',
      },
      {
        icon: 'home',
        title: 'Arrendamento Urbano & Rendas',
        prompt: 'O senhorio pode exigir adiantamento de 6 meses de renda ou expulsar o inquilino sem ordem judicial segundo a Lei n.º 26/15?',
        badge: 'Habitação & Civil',
      },
      {
        icon: 'family_restroom',
        title: 'Herança, Partilha & Sucessão',
        prompt: 'Como funciona a partilha de bens deixados por um familiar falecido e quem são os herdeiros legítimos na lei angolana?',
        badge: 'Família & Herança',
      },
      {
        icon: 'shield',
        title: 'Retenção de Documentos & Abuso',
        prompt: 'A empresa ou senhorio reteve os meus documentos pessoais ou profissionais. Isso é crime em Angola e como agir junto das autoridades?',
        badge: 'Defesa de Direitos',
      },
    ];
  };

  const suggestions = getSuggestionsForProfile();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full select-none animate-in fade-in duration-200">
      {/* Brand Hero */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm flex items-center justify-center mb-3 group hover:border-slate-300 transition-colors">
          <img
            alt="DirIA Logo"
            className="w-full h-full object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3Vv1f7NbMee8p9QNeYms4JW3N0-9KfZODaoUeerJmQntJdA2Sdm8oSH_S9AKMS81JUuxg0582rA0raJphQKBbAZtKFJRhQtrDhYPe3_P9uYuWAT1d8hKIf-suCXP5Or-DwiF7Hr3Fs7lWsI6cFLDiVdnOWb2doWFU9bCDK3Y4g3_XXEG2YbZQn_xtvs4HH4aPTYi71IbktIwh4XAL4REd3k6S4ORJzILnxbpk8W0S6sf47KQRo6j9"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 tracking-tight">
          Em que posso orientar sobre o Direito Angolano?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-2 leading-relaxed">
          Plataforma multidisciplinar de inteligência jurídica. Análises fundamentadas em toda a legislação angolana — Constituição, Código Civil, Comercial, Penal, Tributário (AGT), Imobiliário, Laboral e normas da OAA.
        </p>

        {/* Profile badge callout or Auth suggestion */}
        {isLoggedIn ? (
          userProfile && (
            <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Sessão iniciada como <strong>{userProfile.name || userProfile.role}</strong> ({userProfile.role})
              </span>
              {onOpenAuth && (
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-[11px] font-semibold text-emerald-900 underline hover:text-emerald-700 cursor-pointer ml-1"
                >
                  Minha Conta
                </button>
              )}
            </div>
          )
        ) : (
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-800 font-medium">
              <span className="material-symbols-outlined text-[16px] text-amber-500">lock_open</span>
              <span>Aceda ou crie a sua conta para sincronizar consultas e perfil:</span>
            </span>
            {onOpenAuth && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Registar-se
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Tools Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <button
            onClick={onOpenCalculator}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-700">calculate</span>
            <span>Simulador Laboral</span>
          </button>

          <button
            onClick={onOpenLegalBases}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-600">menu_book</span>
            <span>Diário da República</span>
          </button>

          <button
            onClick={onOpenDrafts}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-600">description</span>
            <span>Minutas & Modelos</span>
          </button>

          <button
            onClick={onOpenLawyersDirectory}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-emerald-700">verified</span>
            <span>Directório OAA</span>
          </button>
        </div>
      </div>

      {/* ChatGPT-style Prompt Cards Grid adapted to Profile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-36 sm:mb-40 pb-4">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="text-left p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-2xs transition-all flex flex-col justify-between gap-2.5 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-900 group-hover:text-primary">
                <span className="material-symbols-outlined text-[17px] text-slate-500 group-hover:text-slate-900">
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 shrink-0">
                {item.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              “{item.prompt}”
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
