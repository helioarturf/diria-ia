import React, { useState } from 'react';
import { Lawyer } from '../types';
import { apiUrl } from '../lib/api';

interface LawyerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (lawyer: Lawyer) => void;
}

const PRESET_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3bXFr46db8P63idUcGifJg_U0ROSIVXJRsoUijBTeOf8Rq0_efwqGMxYyyEhRh9-3Zl3YmQnWbLgo3B18TneFQRJqc8-u7BpPqFgdoMQ5gtKh_22Q4ch4X19tRcFIPKUyN_9o3iLwY19N7wofxAdFA4M1Vuhc9uC2qGJDqdEtQ1L9O7r_cyJdpRrGg8RPxcA2UEg3T-PBIqx0NAZa0N7PSLXz4AHCen_iA8RtpdU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB_FMNZRMcXpiPvIfhONk5QrjrQqgSM-h9YM7wyUPhT3Bj1k-dqoMaZAqXMfmygWDHstaRda76NtoL8UALir6njNAPJ8ShuoWaRkpDH2KAhU6H1ZcOoQHmEFY5CQqfkPB5ED1eXlEX06ZTitCh-DMCNJfTwGAR12MCm4liDtiL6qz6Xv0DbIzFKxj3PkBcp9etQJenUW_xyC459pB8CPuzeZAg1KjKhFGjW3LHFJF4',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
];

const SPECIALTY_OPTIONS = [
  'Laboral & Contencioso',
  'Mediação IGT & Indemnizações',
  'Comercial & Societário',
  'Direito Fiscal & AGT',
  'Direito Penal & Processo',
  'Direito Civil & Imobiliário',
  'Família & Sucessões',
  'Contratos Públicos & Administrativo',
  'Recursos Minerais & Petróleos',
];

const PROVINCE_OPTIONS = [
  'Luanda',
  'Benguela',
  'Huíla',
  'Huambo',
  'Cabinda',
  'Cuanza Sul',
  'Cuanza Norte',
  'Uíge',
  'Namibe',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Zaire',
  'Bengo',
  'Bié',
  'Moxico',
  'Cuando Cubango',
  'Cunene',
];

export const LawyerRegistrationModal: React.FC<LawyerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [entityType, setEntityType] = useState<
    'Advogado Singular' | 'Advogado Estagiário' | 'Sociedade de Advogados / Escritório'
  >('Advogado Singular');

  const [name, setName] = useState('');
  const [oaaNumber, setOaaNumber] = useState('');
  const [province, setProvince] = useState('Luanda');
  const [municipality, setMunicipality] = useState('Ingombota');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+244 9');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_AVATARS[0]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'Laboral & Contencioso',
  ]);
  const [bio, setBio] = useState('');
  const [oaaConfirmed, setOaaConfirmed] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  if (!isOpen) return null;

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBioWithAI = async () => {
    if (!name || selectedSpecialties.length === 0) {
      setValidationError('Preencha o nome e selecione pelo menos uma especialidade antes de gerar a biografia.');
      return;
    }
    setValidationError('');
    setIsGeneratingBio(true);

    try {
      const isOffice = entityType === 'Sociedade de Advogados / Escritório';
      const prompt = `Redige uma apresentação institucional concisa e distinta (cerca de 3 frases em Português de Angola) para um perfil jurídico cadastrado na DirIA Angola:
Nome: ${name}
Tipo: ${entityType}
Cédula/Registo OAA: ${oaaNumber || 'Sob confirmação'}
Província e Município: ${province}, ${municipality}
Especialidades: ${selectedSpecialties.join(', ')}

Tom: sóbrio, rigoroso, respeitando os preceitos deontológicos do Estatuto da Ordem dos Advogados de Angola.`;

      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          consultationType: 'Directório OAA',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setBio(data.text.trim());
        }
      }
    } catch {
      // Fallback bio
      const isOffice = entityType === 'Sociedade de Advogados / Escritório';
      setBio(
        isOffice
          ? `${name} é uma sociedade de advogados sediada em ${municipality}, ${province}, vocacionada para a prestação de serviços jurídicos de elevada exigência nas áreas de ${selectedSpecialties.join(' e ')}.`
          : `${name}, titular da Cédula OAA n.º ${oaaNumber || '---'}, exerce advocacia com sede profissional em ${municipality}, ${province}, especializando-se em ${selectedSpecialties.join(' e ')}.`
      );
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Por favor, informe o nome do jurista ou a designação do escritório.');
      return;
    }

    if (!oaaNumber.trim()) {
      setValidationError('Por favor, informe o número da cédula OAA ou registo oficial.');
      return;
    }

    if (selectedSpecialties.length === 0) {
      setValidationError('Selecione pelo menos uma especialidade jurídica.');
      return;
    }

    if (!oaaConfirmed) {
      setValidationError('É necessária a confirmação de inscrição em vigor ou processo de registo junto da OAA.');
      return;
    }

    const locationStr = `${municipality}, ${province}`;
    const specialtyStr = selectedSpecialties.slice(0, 2).join(' & ');

    const newLawyer: Lawyer = {
      id: `lawyer-${Date.now()}`,
      name: name.trim(),
      oaaNumber: oaaNumber.trim(),
      location: locationStr,
      specialty: specialtyStr,
      phone: phone.trim() || '+244 923 000 000',
      email: email.trim() || undefined,
      photoUrl: photoUrl || PRESET_AVATARS[0],
      available: true,
      entityType,
      province,
      address: address.trim() || undefined,
      bio: bio.trim() || undefined,
      verifiedOaa: true,
      registeredAt: new Date().toLocaleDateString('pt-AO'),
    };

    onRegister(newLawyer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div>
              <h2 className="text-base font-semibold font-headline text-slate-900">
                Cadastro de Jurista ou Escritório
              </h2>
              <p className="text-xs text-slate-500">
                Integração na plataforma DirIA Angola & Directório de Patrocínio Forense da OAA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scroll text-xs">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Type Selector Tabs */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">
              Tipo de Inscrição Profissional
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { type: 'Advogado Singular', icon: 'person', label: 'Advogado(a) Singular' },
                { type: 'Advogado Estagiário', icon: 'school', label: 'Advogado(a) Estagiário' },
                {
                  type: 'Sociedade de Advogados / Escritório',
                  icon: 'corporate_fare',
                  label: 'Sociedade / Escritório',
                },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setEntityType(item.type as any)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    entityType === item.type
                      ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Identification fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {entityType === 'Sociedade de Advogados / Escritório'
                  ? 'Denominação da Sociedade / Escritório *'
                  : 'Nome Completo do(a) Jurista *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  entityType === 'Sociedade de Advogados / Escritório'
                    ? 'Ex: Vunge & Associados — Sociedade de Advogados'
                    : 'Ex: Dr. Manuel Vunge'
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {entityType === 'Sociedade de Advogados / Escritório'
                  ? 'N.º de Registo na OAA / RLA *'
                  : 'N.º da Cédula Profissional OAA *'}
              </label>
              <input
                type="text"
                required
                value={oaaNumber}
                onChange={(e) => setOaaNumber(e.target.value)}
                placeholder="Ex: 5410 ou RLA/OAA-120"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
            </div>
          </div>

          {/* Location fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Província (República de Angola)
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              >
                {PROVINCE_OPTIONS.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Município / Distrito Urbano
              </label>
              <input
                type="text"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="Ex: Talatona, Ingombota, Viana"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Endereço Físico do Escritório
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua Rainha Ginga, Edif. Kilamba"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Contact fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contacto Telefónico (+244) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+244 923 000 000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                E-mail Profissional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@advocacia.ao"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Specialties Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700">
                Especialidades de Actuação (seleccione até 4)
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedSpecialties.length} selecionada(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SPECIALTY_OPTIONS.map((spec) => {
                const isSelected = selectedSpecialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar / Photo Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Foto de Perfil ou Logótipo do Escritório
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-300 shrink-0">
                <img
                  src={photoUrl}
                  alt="Pré-visualização"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scroll">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(url)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform cursor-pointer shrink-0 ${
                        photoUrl === url ? 'border-slate-900 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="Opção" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">upload</span>
                    <span>Carregar ficheiro</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">ou escolha um dos avatares institucionais</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio with AI generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Apresentação Institucional / Resumo Curricular
              </label>
              <button
                type="button"
                onClick={handleGenerateBioWithAI}
                disabled={isGeneratingBio}
                className="text-[11px] font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                <span>{isGeneratingBio ? 'A gerar...' : 'Refinar com DirIA'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Descreva a experiência forense, atuação em tribunais da comarca, salas de mediação da IGT e áreas de relevo..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pré-visualização do Cartão na DirIA:
            </span>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <img
                    className="w-full h-full object-cover"
                    alt={name || 'Jurista'}
                    src={photoUrl}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {name || 'Nome do Jurista ou Escritório'}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    Cédula OAA n.º {oaaNumber || '----'} • {municipality || 'Município'}, {province}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium truncate">
                    {selectedSpecialties.slice(0, 2).join(' & ') || 'Especialidades'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium shrink-0">
                {entityType === 'Sociedade de Advogados / Escritório' ? 'Sociedade' : 'Advogado'}
              </span>
            </div>
          </div>

          {/* Deontological confirmation */}
          <label className="flex items-start gap-2 cursor-pointer p-1">
            <input
              type="checkbox"
              checked={oaaConfirmed}
              onChange={(e) => setOaaConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="text-[11px] text-slate-600 leading-relaxed">
              Declaro que os dados fornecidos são verídicos e correspondem a advogado com inscrição em vigor ou sociedade registada na Ordem dos Advogados de Angola (OAA), em conformidade com o Estatuto da OAA e Código Deontológico.
            </span>
          </label>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>Concluir Cadastro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
