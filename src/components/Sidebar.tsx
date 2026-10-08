import React from 'react';
import { Consultation, UserProfile } from '../types';

interface SidebarProps {
  consultations: Consultation[];
  activeConsultationId: string;
  onSelectConsultation: (id: string) => void;
  onNewConsultation: () => void;
  onDeleteConsultation?: (id: string) => void;
  onExportConsultation?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop?: boolean;
  onToggleCollapseDesktop?: () => void;
  onOpenLegalBases: () => void;
  onOpenLawyersDirectory: () => void;
  onOpenLawyerRegistration: () => void;
  onOpenCalculator: () => void;
  onOpenDrafts: () => void;
  onOpenSettings: () => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onOpenAuth?: (initialMode?: 'login' | 'register') => void;
  isLoggedIn?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  consultations,
  activeConsultationId,
  onSelectConsultation,
  onNewConsultation,
  onDeleteConsultation,
  onExportConsultation,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop = false,
  onToggleCollapseDesktop,
  onOpenLegalBases,
  onOpenLawyersDirectory,
  onOpenLawyerRegistration,
  onOpenCalculator,
  onOpenDrafts,
  onOpenSettings,
  userProfile,
  onOpenProfile,
  onOpenAuth,
  isLoggedIn = false,
}) => {
  const showCollapsed = isCollapsedDesktop && !isOpenMobile;

  const legalTools = [
    {
      id: 'profile',
      label: 'Perfil & Experiência',
      badge: userProfile ? userProfile.role.split(' ')[0] : 'Perfil',
      badgeClass: 'group-hover:bg-purple-50 group-hover:text-purple-700',
      icon: 'badge',
      iconColor: 'text-purple-700',
      iconDefaultColor: 'text-slate-500 group-hover:text-purple-700',
      title: 'Perfil de Experiência do Utilizador',
      onClick: onOpenProfile || onOpenSettings,
    },
    {
      id: 'calculator',
      label: 'Calculadora Laboral',
      badge: 'Lei 12/23',
      badgeClass: 'group-hover:bg-amber-50 group-hover:text-amber-700',
      icon: 'calculate',
      iconColor: 'text-amber-700',
      iconDefaultColor: 'text-slate-500 group-hover:text-amber-700',
      title: 'Calculadora Laboral (Lei 12/23)',
      onClick: onOpenCalculator,
    },
    {
      id: 'drafts',
      label: 'Minutas & Peças',
      badge: 'Modelos',
      badgeClass: 'group-hover:bg-sky-50 group-hover:text-sky-700',
      icon: 'description',
      iconColor: 'text-sky-700',
      iconDefaultColor: 'text-slate-500 group-hover:text-sky-700',
      title: 'Minutas & Peças Jurídicas (Modelos)',
      onClick: onOpenDrafts,
    },
    {
      id: 'laws',
      label: 'Diário da República',
      badge: 'Leis',
      badgeClass: 'group-hover:bg-emerald-50 group-hover:text-emerald-700',
      icon: 'menu_book',
      iconColor: 'text-emerald-700',
      iconDefaultColor: 'text-slate-500 group-hover:text-emerald-700',
      title: 'Diário da República (Legislação de Angola)',
      onClick: onOpenLegalBases,
    },
    {
      id: 'directory',
      label: 'Directório Oficial OAA',
      badge: 'OAA',
      badgeClass: 'group-hover:bg-blue-50 group-hover:text-blue-700',
      icon: 'verified',
      iconColor: 'text-blue-700',
      iconDefaultColor: 'text-slate-500 group-hover:text-blue-700',
      title: 'Directório Oficial OAA (Advogados e Sociedades)',
      onClick: onOpenLawyersDirectory,
    },
    {
      id: 'register',
      label: 'Cadastrar Jurista / Sociedade',
      badge: '',
      isSpecial: true,
      icon: 'how_to_reg',
      iconColor: 'text-emerald-700',
      iconDefaultColor: 'text-emerald-700',
      title: 'Cadastrar Jurista ou Sociedade de Advogados na OAA',
      onClick: onOpenLawyerRegistration,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 border-r border-slate-200/80 bg-white/95 md:bg-white/80 backdrop-blur-md flex flex-col justify-between shrink-0 select-none transition-all duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl w-64' : '-translate-x-full md:translate-x-0'
        } ${showCollapsed ? 'md:w-16 w-16' : 'w-64 md:w-64 xl:md:w-72'}`}
      >
        {/* COLLAPSED MODE (ICON RAIL) */}
        {showCollapsed ? (
          <div className="py-3 px-2 flex flex-col items-center gap-3 overflow-y-auto custom-scroll">
            {/* Logo / Expand Toggle */}
            <div className="flex flex-col items-center gap-2 pb-2 border-b border-slate-100 w-full">
              <button
                onClick={onToggleCollapseDesktop}
                className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center p-1 border border-slate-200 bg-white shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group"
                title="DirIA Angola - Clique para expandir a barra lateral (⌘B)"
              >
                <img
                  alt="DirIA Logo"
                  className="w-full h-full object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3Vv1f7NbMee8p9QNeYms4JW3N0-9KfZODaoUeerJmQntJdA2Sdm8oSH_S9AKMS81JUuxg0582rA0raJphQKBbAZtKFJRhQtrDhYPe3_P9uYuWAT1d8hKIf-suCXP5Or-DwiF7Hr3Fs7lWsI6cFLDiVdnOWb2doWFU9bCDK3Y4g3_XXEG2YbZQn_xtvs4HH4aPTYi71IbktIwh4XAL4REd3k6S4ORJzILnxbpk8W0S6sf47KQRo6j9"
                />
              </button>

              <button
                onClick={onToggleCollapseDesktop}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                title="Expandir Barra Lateral (⌘B)"
              >
                <span className="material-symbols-outlined text-[20px]">left_panel_open</span>
              </button>
            </div>

            {/* Quick Actions (Nova Consulta & Exportar) */}
            <div className="flex flex-col items-center gap-2 pb-2 border-b border-slate-100 w-full">
              <button
                onClick={() => {
                  onNewConsultation();
                  onCloseMobile();
                }}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shadow-2xs transition-all hover:border-slate-300 cursor-pointer group"
                title="Nova consulta (⌘N)"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-700 group-hover:scale-110 transition-transform">
                  add
                </span>
              </button>

              {onExportConsultation && (
                <button
                  onClick={() => {
                    onExportConsultation();
                    onCloseMobile();
                  }}
                  className="w-10 h-10 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Exportar ou Copiar Consulta Atual"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">
                    ios_share
                  </span>
                </button>
              )}
            </div>

            {/* Ícones de Ferramentas e Recursos (Texto e consultas ocultas) */}
            <div className="flex flex-col items-center gap-2 w-full pt-1">
              {legalTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    tool.onClick();
                    onCloseMobile();
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    tool.isSpecial
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200'
                  }`}
                  title={tool.title}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                      tool.isSpecial ? 'text-emerald-700' : tool.iconColor
                    }`}
                  >
                    {tool.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* EXPANDED MODE (FULL SIDEBAR) */
          <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scroll">
            {/* App Brand */}
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <button
                onClick={onNewConsultation}
                className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center p-0.5 border border-slate-200 bg-white shadow-2xs group-hover:border-slate-400 transition-colors">
                  <img
                    alt="DirIA Logo"
                    className="w-full h-full object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3Vv1f7NbMee8p9QNeYms4JW3N0-9KfZODaoUeerJmQntJdA2Sdm8oSH_S9AKMS81JUuxg0582rA0raJphQKBbAZtKFJRhQtrDhYPe3_P9uYuWAT1d8hKIf-suCXP5Or-DwiF7Hr3Fs7lWsI6cFLDiVdnOWb2doWFU9bCDK3Y4g3_XXEG2YbZQn_xtvs4HH4aPTYi71IbktIwh4XAL4REd3k6S4ORJzILnxbpk8W0S6sf47KQRo6j9"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline font-semibold text-slate-900 text-base leading-none">
                    DirIA
                  </span>
                  <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mt-0.5">
                    Angola • OAA
                  </span>
                </div>
              </button>

              {/* Collapse toggle button */}
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onCloseMobile();
                  } else if (onToggleCollapseDesktop) {
                    onToggleCollapseDesktop();
                  }
                }}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center"
                title="Recolher Barra Lateral (⌘B)"
              >
                <span className="material-symbols-outlined text-[18px]">left_panel_close</span>
              </button>
            </div>

            {/* New Consultation & Export Actions */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  onNewConsultation();
                  onCloseMobile();
                }}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium flex items-center gap-2 shadow-2xs transition-all hover:border-slate-300 group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-slate-900 transition-colors">
                  add
                </span>
                <span>Nova consulta</span>
              </button>

              {onExportConsultation && (
                <button
                  onClick={() => {
                    onExportConsultation();
                    onCloseMobile();
                  }}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200/70 bg-slate-50/60 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  title="Copiar texto da consulta atual para a área de transferência"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-500">
                    ios_share
                  </span>
                  <span>Exportar Consulta</span>
                </button>
              )}
            </div>

            {/* History / Recents (Exibidas apenas no modo expandido) */}
            <div className="flex flex-col gap-1 mt-2">
              <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                <span>Consultas Recentes</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  {consultations.length}
                </span>
              </div>

              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto custom-scroll pr-0.5">
                {consultations.map((c) => {
                  const isActive = c.id === activeConsultationId;
                  return (
                    <div
                      key={c.id}
                      className={`w-full group/item rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-slate-100/90 text-slate-900 font-medium'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectConsultation(c.id);
                          onCloseMobile();
                        }}
                        className="flex-1 min-w-0 text-left px-3 py-2 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover/item:text-slate-600 shrink-0">
                          chat_bubble
                        </span>
                        <span className="truncate">{c.title}</span>
                      </button>
                      {onDeleteConsultation && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConsultation(c.id);
                          }}
                          className="opacity-0 group-hover/item:opacity-100 hover:text-rose-600 text-slate-400 p-1.5 mr-1 rounded transition-opacity cursor-pointer shrink-0"
                          title="Eliminar consulta"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      )}
                      {isActive && !onDeleteConsultation && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mr-3"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legal Tools & Actions com texto e badges */}
            <div className="flex flex-col gap-1 mt-2 border-t border-slate-100 pt-3">
              <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                <span>Ferramentas & Recursos</span>
              </div>

              {legalTools.map((tool) =>
                tool.isSpecial ? (
                  <button
                    key={tool.id}
                    onClick={() => {
                      tool.onClick();
                      onCloseMobile();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/70 flex items-center gap-2.5 transition-colors cursor-pointer mt-1"
                    title={tool.title}
                  >
                    <span className="material-symbols-outlined text-[17px] text-emerald-700 shrink-0">
                      {tool.icon}
                    </span>
                    <span className="truncate">{tool.label}</span>
                  </button>
                ) : (
                  <button
                    key={tool.id}
                    onClick={() => {
                      tool.onClick();
                      onCloseMobile();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 flex items-center justify-between transition-colors cursor-pointer group"
                    title={tool.title}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`material-symbols-outlined text-[17px] shrink-0 transition-colors ${tool.iconDefaultColor}`}
                      >
                        {tool.icon}
                      </span>
                      <span className="truncate font-medium">{tool.label}</span>
                    </div>
                    {tool.badge && (
                      <span
                        className={`text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded transition-colors ${tool.badgeClass}`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Bottom Profile / Settings */}
        {showCollapsed ? (
          <div className="p-2 border-t border-slate-200/80 bg-slate-50/50 flex flex-col items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : (onOpenProfile || onOpenSettings)()}
                className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0 cursor-pointer hover:opacity-90 shadow-2xs relative"
                title={`Conta Activa: ${userProfile?.name || userProfile?.role} (${userProfile?.role})`}
              >
                {userProfile?.name ? userProfile.name.slice(0, 2).toUpperCase() : 'AO'}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                title="Entrar ou Cadastrar"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-lg hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
              title="Definições do Sistema"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 flex flex-col gap-2 shrink-0">
            {!isLoggedIn && (
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/70">
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[15px]">login</span>
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('register')}
                  className="flex-1 py-1.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">person_add</span>
                  Cadastrar
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (onOpenAuth) {
                    onOpenAuth('login');
                  } else if (onOpenProfile) {
                    onOpenProfile();
                  } else {
                    onOpenSettings();
                  }
                }}
                className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group flex-1 mr-1"
                title={isLoggedIn ? 'Gerir Conta e Perfil' : 'Configurar Perfil de Experiência'}
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0 group-hover:ring-2 ring-slate-300 transition-all relative">
                  {userProfile?.name ? userProfile.name.slice(0, 2).toUpperCase() : 'AO'}
                  {isLoggedIn && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-slate-800 truncate group-hover:text-slate-950 transition-colors">
                    {userProfile?.name || userProfile?.role || 'Cidadão / Jurista'}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <span className="truncate">
                      {isLoggedIn ? (userProfile?.email || userProfile?.role) : `${userProfile?.role}`}
                    </span>
                  </span>
                </div>
              </button>
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                title="Definições"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
