import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  isLoggedIn?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearHistory,
  userProfile,
  onOpenProfile,
  onOpenAuth,
  isLoggedIn = false,
}) => {
  const [jurisdiction, setJurisdiction] = useState('Angola (Geral - Luanda)');
  const [voiceSpeed, setVoiceSpeed] = useState('Normal (1.0x)');
  const [fontSize, setFontSize] = useState('Padrão (14px)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold font-headline text-slate-900">
                Definições da Aplicação
              </h2>
              <p className="text-xs text-slate-500">DirIA Angola • Ordem Jurídica Unificada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Account Authentication Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-900">
                  {isLoggedIn ? 'account_circle' : 'lock'}
                </span>
                Conta & Autenticação
              </span>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth(isLoggedIn ? 'login' : 'login');
                  }}
                  className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  {isLoggedIn ? 'Gerir Conta' : 'Entrar / Cadastrar'}
                </button>
              )}
            </div>
            <div className="text-[11px] text-slate-600">
              {isLoggedIn ? (
                <p>
                  Sessão iniciada como <strong>{userProfile?.name || 'Utilizador'}</strong> ({userProfile?.email || userProfile?.role})
                </p>
              ) : (
                <p>
                  Nenhuma conta activa. Inicie sessão ou efectue o cadastro para salvar as suas consultas e credenciais.
                </p>
              )}
            </div>
          </div>

          {/* User Experience Profile Section */}
          {userProfile && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-900">badge</span>
                  Perfil de Experiência
                </span>
                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenProfile();
                    }}
                    className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
                  >
                    Personalizar
                  </button>
                )}
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p>
                  <strong>Papel:</strong> {userProfile.role} ({userProfile.experienceLevel})
                </p>
                <p>
                  <strong>Estilo:</strong> {userProfile.responseStyle}
                </p>
                <p className="truncate">
                  <strong>Áreas:</strong> {userProfile.primaryAreas.slice(0, 3).join(', ')}
                  {userProfile.primaryAreas.length > 3 ? '...' : ''}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Âmbito Legislativo
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-slate-900">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                <span>Cobertura Multidisciplinar Completa</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                A aplicação não se limita a uma única lei. Abrange a Constituição, Código Civil, Comercial, Penal, Fiscal (AGT), Arrendamento, Laboral, Terras e Direito Administrativo de Angola.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jurisdição & Província
            </label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
            >
              <option value="Angola (Geral - Luanda)">Luanda (Sede OAA & Tribunais Centrais)</option>
              <option value="Benguela">Benguela (Tribunal de Comarca de Benguela e Lobito)</option>
              <option value="Huíla">Huíla (Comarca do Lubango)</option>
              <option value="Huambo">Huambo</option>
              <option value="Cabinda">Cabinda</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Velocidade da Voz PT-AO
              </label>
              <select
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="Normal (1.0x)">Normal (1.0x)</option>
                <option value="Calma (0.9x)">Calma (0.9x)</option>
                <option value="Rápida (1.15x)">Rápida (1.15x)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tamanho da Fonte
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="Padrão (14px)">Padrão (14px)</option>
                <option value="Maior (16px)">Maior (16px)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-700 block">Histórico de Consultas</span>
              <span className="text-[11px] text-slate-500">Limpar consultas armazenadas no navegador</span>
            </div>
            {confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            {savedSuccess ? 'Guardado com sucesso!' : 'Guardar Preferências'}
          </button>
        </div>
      </div>
    </div>
  );
};
