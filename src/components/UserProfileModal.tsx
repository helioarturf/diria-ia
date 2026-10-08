import React, { useState } from 'react';
import { UserProfile, ExperienceRole, ExperienceLevel, ResponseStyle } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ALL_LEGAL_AREAS = [
  'Direito Civil & Obrigações',
  'Direito Comercial & Sociedades',
  'Direito Laboral & Segurança Social',
  'Direito Penal & Processo Penal',
  'Direito Fiscal & Tributário (AGT)',
  'Direito Imobiliário & Arrendamento',
  'Direito de Família & Sucessões',
  'Direito Administrativo & Contratação Pública',
  'Direito Bancário & Cambial (BNA)',
  'Direito Constitucional & Garantias',
  'Direito Marítimo & Aduaneiro',
  'Petróleos, Gás & Minerais',
];

export const PROVINCES_ANGOLA = [
  'Luanda (Comarca Central, Viana, Belas, Cacuaco)',
  'Benguela (Comarca de Benguela e Lobito)',
  'Huíla (Comarca do Lubango)',
  'Huambo',
  'Cabinda',
  'Cuanza Sul (Sumbe/Porto Amboim)',
  'Cuanza Norte (Ndalatando)',
  'Malanje',
  'Uíge',
  'Zaire (Soyo/Mbanza Kongo)',
  'Namibe',
  'Cunene',
  'Bié',
  'Moxico',
  'Lunda Norte',
  'Lunda Sul',
  'Cuando Cubango',
  'Bengo (Caxito)',
];

export const PROFILE_PRESETS: {
  role: ExperienceRole;
  level: ExperienceLevel;
  style: ResponseStyle;
  icon: string;
  badge: string;
  desc: string;
  sampleQuote: string;
}[] = [
  {
    role: 'Cidadão / Utente',
    level: 'Iniciante',
    style: 'Prático & Directo',
    icon: 'person',
    badge: 'Uso Pessoal & Direitos',
    desc: 'Linguagem clara e humana, sem latinismos complexos. Foco prático no que você tem direito e passos imediatos.',
    sampleQuote: '«Você tem direito a receber o valor X no prazo de 15 dias. Eis os 3 passos práticos para requerer o pagamento...»',
  },
  {
    role: 'Estudante de Direito',
    level: 'Intermédio',
    style: 'Equilibrado & Fundamentado',
    icon: 'school',
    badge: 'Académico & Doutrina',
    desc: 'Explicativo e formativo. Detalha a génese das normas angolanas, artigos específicos, doutrina e interpretação sistemática.',
    sampleQuote: '«Segundo a doutrina civilista e o art.º 406.º do Código Civil angolano, o princípio pacta sunt servanda impõe que...»',
  },
  {
    role: 'Advogado / Jurista',
    level: 'Avançado / Especialista',
    style: 'Parecer Técnico Forense',
    icon: 'gavel',
    badge: 'Prática Forense & Tribunais',
    desc: 'Máximo rigor técnico, terminologia processual do foro angolano, análise de prazos peremptórios, ónus da prova e estratégia.',
    sampleQuote: '«Tratando-se de mora debitoris em contrato de empreitada, impõe-se a interpelação admonitória com cominação rescisória nos termos do art.º 808.º...»',
  },
  {
    role: 'Empresário / Gestor de RH',
    level: 'Intermédio',
    style: 'Prático & Directo',
    icon: 'business_center',
    badge: 'Negócios & Governança',
    desc: 'Foco na mitigação de passivos, riscos laborais e fiscais (AGT/INSS), conformidade regulatória e boas práticas de gestão.',
    sampleQuote: '«Risco de contingência laboral médio/alto. Recomenda-se acordo revogatório com quitação total para prevenir litígios na Sala de Trabalho...»',
  },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PROFILE_PRESETS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      role: preset.role,
      experienceLevel: preset.level,
      responseStyle: preset.style,
    }));
  };

  const toggleArea = (area: string) => {
    setFormData((prev) => {
      const exists = prev.primaryAreas.includes(area);
      const updated = exists
        ? prev.primaryAreas.filter((a) => a !== area)
        : [...prev.primaryAreas, area];
      return { ...prev, primaryAreas: updated };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div>
              <h2 className="text-base font-semibold font-headline text-slate-900">
                Perfil de Experiência do Utilizador
              </h2>
              <p className="text-xs text-slate-500">
                Adapte as consultas à sua área de actuação, nível técnico e estilo de resposta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scroll">
          {/* Quick Presets Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                1. Escolha o seu perfil de experiência
              </label>
              <span className="text-[11px] text-slate-400">Clique para aplicar predefinição</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROFILE_PRESETS.map((preset) => {
                const isSelected = formData.role === preset.role;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-[20px] ${
                              isSelected ? 'text-slate-900 font-bold' : 'text-slate-600'
                            }`}
                          >
                            {preset.icon}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              isSelected ? 'text-slate-900' : 'text-slate-800'
                            }`}
                          >
                            {preset.role}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{preset.desc}</p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">{preset.level}</span>
                      <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {preset.style}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome ou Como prefere ser tratado (opcional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Colega Advogado, Dr. Carlos, Maria..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Gabinete, Sociedade ou Instituição (opcional)
              </label>
              <input
                type="text"
                value={formData.institutionOrFirm || ''}
                onChange={(e) => setFormData({ ...formData, institutionOrFirm: e.target.value })}
                placeholder="Ex: Escritório Luanda, Estudante UAN, Empresa..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nível de Familiaridade com Legislação Angolana
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) =>
                  setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
              >
                <option value="Iniciante">Iniciante (Requer explicações acessíveis)</option>
                <option value="Intermédio">Intermédio (Domina conceitos básicos e procedimentos)</option>
                <option value="Avançado / Especialista">Avançado / Especialista (Prática forense & contencioso)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Estilo & Tom da Resposta Jurídica
              </label>
              <select
                value={formData.responseStyle}
                onChange={(e) =>
                  setFormData({ ...formData, responseStyle: e.target.value as ResponseStyle })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
              >
                <option value="Prático & Directo">Prático & Directo (Pontos chave e próximos passos)</option>
                <option value="Equilibrado & Fundamentado">Equilibrado & Fundamentado (Artigos + Explicação)</option>
                <option value="Parecer Técnico Forense">Parecer Técnico Forense (Análise exaustiva, termos do foro)</option>
              </select>
            </div>
          </div>

          {/* Província / Foro */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Província / Comarca Judicial de Referência
            </label>
            <select
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
            >
              {PROVINCES_ANGOLA.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Permite contextualizar tribunais de comarca, salas de trabalho/cível, delegações da IGT e conservatórias locais.
            </p>
          </div>

          {/* Legal Areas of Interest */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                2. Áreas do Direito Angolano em Foco (Multidisciplinar)
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.primaryAreas.length} seleccionadas
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2.5">
              A aplicação abrange toda a ordem jurídica de Angola — seleccione os ramos onde deseja maior ênfase:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {ALL_LEGAL_AREAS.map((area) => {
                const isSelected = formData.primaryAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <span className="mr-1 text-[11px]">✓</span>}
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulation Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
            <div className="flex items-center gap-2 mb-1.5 text-slate-700 font-semibold">
              <span className="material-symbols-outlined text-[16px] text-slate-900">tune</span>
              <span>Como o DirIA responderá ao seu perfil:</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed italic">
              «Olá{formData.name ? `, ${formData.name}` : ''}. Na qualidade de <strong>{formData.role}</strong> ({formData.experienceLevel}), as análises focarão num estilo <strong>{formData.responseStyle}</strong> com enquadramento das comarcas de <strong>{formData.province.split(' ')[0]}</strong>, abrangendo todas as fontes do Direito Angolano (CRA, Códigos Civil, Comercial, Penal, Tributário, etc.).»
            </p>
          </div>
        </form>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {savedFeedback ? (
              <>
                <span className="material-symbols-outlined text-[16px] text-emerald-400">check</span>
                <span>Perfil Actualizado!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Guardar Perfil de Experiência</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
