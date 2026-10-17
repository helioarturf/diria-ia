import React from 'react';
import { Consultation, UserProfile } from '../types';

interface HeaderProps {
  consultation: Consultation;
  onToggleMobileSidebar: () => void;
  isCollapsedDesktop?: boolean;
  onToggleDesktopSidebar?: () => void;
  onNewConsultation?: () => void;
  onExport: () => void;
  onOpenCalculator?: () => void;
  onOpenDrafts?: () => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onOpenAuth?: (initialMode?: 'login' | 'register') => void;
  isLoggedIn?: boolean;
  onOpenUserDashboard?: () => void;
  onOpenLawyerPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onExport,
  userProfile,
  onOpenProfile,
  onOpenAuth,
  isLoggedIn = false,
  onOpenUserDashboard,
  onOpenLawyerPortal,
}) => {
  return (
    <header className="h-12 border-b border-slate-200/60 px-4 sm:px-6 bg-white/70 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
      <button
        onClick={onToggleMobileSidebar}
        className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
        title="Abrir Menu"
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>

      <div className="flex items-center gap-2 text-xs ml-auto">
        {/* Auth CTA if not logged in */}
        {!isLoggedIn && onOpenAuth && (
          <div className="flex items-center gap-1 sm:gap-1.5 mr-1">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-2.5 py-1 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer font-medium text-[11px] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">login</span>
              <span className="hidden sm:inline">Entrar</span>
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors cursor-pointer text-[11px] flex items-center gap-1 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px]">person_add</span>
              <span>Cadastrar</span>
            </button>
          </div>
        )}

        {/* Painel CTA only for logged in users, tailored by role */}
        {isLoggedIn && onOpenUserDashboard && (
          <button
            onClick={onOpenUserDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer text-[11px] font-semibold border border-slate-200/80"
            title="Abrir Painel do Utente (Documentos, Consultas e Juristas)"
          >
            <span className="material-symbols-outlined text-[15px] text-emerald-600">space_dashboard</span>
            <span className="hidden sm:inline">Painel do Utente</span>
          </button>
        )}

        {isLoggedIn && userProfile?.role === 'Advogado / Jurista' && onOpenLawyerPortal && (
          <button
            onClick={onOpenLawyerPortal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer text-[11px] font-semibold shadow-2xs"
            title="Abrir Painel do Advogado & Escritório (Solicitações, Agenda e Relatórios)"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-400">gavel</span>
            <span className="hidden sm:inline">Painel do Advogado</span>
          </button>
        )}

        {/* User profile / account chip */}
        {userProfile && (
          <button
            onClick={() => onOpenAuth ? onOpenAuth('login') : onOpenProfile && onOpenProfile()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200/70"
            title={isLoggedIn ? `Conta: ${userProfile.name || userProfile.email || userProfile.role}` : 'Personalizar Perfil de Experiência do Utilizador'}
          >
            <span className="material-symbols-outlined text-[16px] text-slate-600">
              {isLoggedIn ? 'account_circle' : 'badge'}
            </span>
            <span className="font-medium truncate max-w-[120px] sm:max-w-none">
              {isLoggedIn && userProfile.name ? userProfile.name.split(' ')[0] : userProfile.role}
            </span>
            <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
              ({userProfile.experienceLevel})
            </span>
          </button>
        )}

        <button
          onClick={onExport}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center"
          title="Exportar ou Copiar Consulta"
        >
          <span className="material-symbols-outlined text-[19px]">ios_share</span>
        </button>
      </div>
    </header>
  );
};
