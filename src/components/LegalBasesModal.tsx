import React, { useState } from 'react';
import { LEX_DIPLOMAS } from '../data/lexDiplomas';
import { LegalDiploma } from '../types';

interface LegalBasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAboutLaw: (lawTitle: string, article?: string) => void;
  onToast?: (message: string) => void;
}

export const LegalBasesModal: React.FC<LegalBasesModalProps> = ({
  isOpen,
  onClose,
  onAskAboutLaw,
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [expandedDiplomaId, setExpandedDiplomaId] = useState<string | null>(LEX_DIPLOMAS[0].id);

  if (!isOpen) return null;

  const typeOptions = ['Todos', 'Leis', 'Códigos', 'Decretos Presidenciais'];

  const categoryOptions = [
    'Todas',
    'Trabalho & Segurança Social',
    'Fiscal & Aduaneiro',
    'Penal & Processual',
    'Constitucional & Direitos',
    'Comercial & Empresas',
    'Civil & Arrendamento',
    'Bancário & Câmbios',
  ];

  const filteredDiplomas = LEX_DIPLOMAS.filter((dip) => {
    // Type filter
    let matchesType = true;
    if (selectedType === 'Leis') matchesType = dip.type === 'Lei';
    else if (selectedType === 'Códigos') matchesType = dip.type === 'Código';
    else if (selectedType === 'Decretos Presidenciais') matchesType = dip.type === 'Decreto Presidencial';

    // Category filter
    const matchesCategory = selectedCategory === 'Todas' || dip.category === selectedCategory;

    // Search filter
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      dip.number.toLowerCase().includes(term) ||
      dip.title.toLowerCase().includes(term) ||
      dip.summary.toLowerCase().includes(term) ||
      dip.issuer.toLowerCase().includes(term) ||
      dip.diarioRepublica.toLowerCase().includes(term) ||
      dip.tags.some((t) => t.toLowerCase().includes(term)) ||
      (dip.keyArticles &&
        dip.keyArticles.some(
          (a) =>
            a.number.toLowerCase().includes(term) ||
            a.title.toLowerCase().includes(term) ||
            a.content.toLowerCase().includes(term)
        ));

    return matchesType && matchesCategory && matchesSearch;
  });

  const handleCopyCitation = (diploma: LegalDiploma, articleNumber?: string) => {
    const citation = articleNumber
      ? `Nos termos do ${articleNumber} da ${diploma.number} (${diploma.title}), Diário da República (${diploma.diarioRepublica}).`
      : `Conforme a ${diploma.number} (${diploma.title}), aprovada por ${diploma.issuer}, Diário da República (${diploma.diarioRepublica}).`;

    navigator.clipboard.writeText(citation);
    onToast?.('Citação jurídica copiada para a área de transferência!');
  };

  const handleDownloadDiplomaSummary = (diploma: LegalDiploma) => {
    let content = `======================================================
REPÚBLICA DE ANGOLA — DIÁRIO DA REPÚBLICA
BASES JURÍDICAS & DIPLOMAS LEGAIS VIGENTES
======================================================

DIPLOMA: ${diploma.number}
TÍTULO: ${diploma.title}
TIPO: ${diploma.type}
ÓRGÃO EMISSOR: ${diploma.issuer}
DIÁRIO DA REPÚBLICA: ${diploma.diarioRepublica}
ESTADO DE VIGÊNCIA: ${diploma.status}
ÁREA DO DIREITO: ${diploma.category}

SUMÁRIO OFICIAL (EMENTA):
${diploma.summary}

------------------------------------------------------
ARTIGOS-CHAVE & EXCERTOS NORMATIVOS:
------------------------------------------------------
`;

    if (diploma.keyArticles && diploma.keyArticles.length > 0) {
      diploma.keyArticles.forEach((art) => {
        content += `\n[${art.number}] ${art.title}\n${art.content}\n`;
      });
    }

    content += `\n======================================================
Compilado e verificado via DirIA Angola
======================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diploma.number.replace(/[^a-zA-Z0-9]/g, '_')}_Diario_Republica_Angola.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onToast?.(`Ficha da ${diploma.number} transferida com sucesso!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </div>
            <div>
              <h2 className="text-base font-semibold font-headline text-slate-900">
                Diário da República & Bases Jurídicas de Angola
              </h2>
              <p className="text-xs text-slate-500">
                Acervo de leis, códigos fundamentais e decretos em vigor na República de Angola
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

        {/* Search and Filters */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-100 space-y-2.5 shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por diploma (ex: 12/23, 38/20), artigo (ex: Art. 232), palavras-chave..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
            {/* Type buttons */}
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scroll w-full sm:w-auto">
              {typeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedType === t
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Category dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[11px] text-slate-500 hidden sm:inline">Área:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scroll flex-1 bg-slate-50/30">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>
              A apresentar <strong>{filteredDiplomas.length}</strong> diplomas legais vigentes
            </span>
            <span className="text-[11px] font-mono text-slate-400">Diário da República (I Série)</span>
          </div>

          {filteredDiplomas.map((diploma) => {
            const isExpanded = expandedDiplomaId === diploma.id;

            return (
              <div
                key={diploma.id}
                className={`rounded-2xl border transition-all bg-white shadow-2xs overflow-hidden ${
                  isExpanded ? 'border-slate-300 ring-1 ring-slate-200/80' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedDiplomaId(isExpanded ? null : diploma.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="material-symbols-outlined text-amber-700 text-[22px] shrink-0 mt-0.5">
                      gavel
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {diploma.number}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {diploma.status}
                        </span>
                        <span className="text-[11px] text-slate-500">{diploma.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold font-headline text-slate-900 truncate">
                        {diploma.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {diploma.diarioRepublica} • {diploma.issuer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAboutLaw(diploma.title);
                        onClose();
                      }}
                      className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">chat</span>
                      <span>Consultar DirIA</span>
                    </button>
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 space-y-4 bg-slate-50/30 text-xs">
                    {/* Summary */}
                    <div>
                      <span className="font-semibold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                        Sumário Oficial (Ementa):
                      </span>
                      <p className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        {diploma.summary}
                      </p>
                    </div>

                    {/* Key Articles */}
                    {diploma.keyArticles && diploma.keyArticles.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-700 block mb-2 text-[11px] uppercase tracking-wider">
                          Artigos em Destaque:
                        </span>
                        <div className="space-y-2">
                          {diploma.keyArticles.map((art, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 font-mono">
                                    {art.number}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="font-semibold text-slate-800">
                                    {art.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCitation(diploma, art.number)}
                                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer"
                                    title="Copiar citação para minuta"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">
                                      content_copy
                                    </span>
                                    <span>Citar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onAskAboutLaw(diploma.title, art.number);
                                      onClose();
                                    }}
                                    className="text-[10px] text-slate-900 hover:underline font-medium"
                                  >
                                    Explicar ↗
                                  </button>
                                </div>
                              </div>
                              <p className="text-slate-600 leading-relaxed italic text-[11px]">
                                “{art.content}”
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags & Action row */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyCitation(diploma)}
                          className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">content_copy</span>
                          <span>Copiar Citação</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadDiplomaSummary(diploma)}
                          className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">download</span>
                          <span>Baixar Ficha</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {diploma.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredDiplomas.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                search_off
              </span>
              <p>Nenhum diploma legal encontrado para os critérios de busca.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('Todos');
                  setSelectedCategory('Todas');
                }}
                className="text-xs text-primary font-medium hover:underline text-slate-700"
              >
                Limpar filtros de pesquisa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
