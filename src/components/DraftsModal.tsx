import React, { useState } from 'react';
import { PRESET_DRAFTS } from '../data/legalData';

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCustomDraft: (docType: string) => void;
}

export const DraftsModal: React.FC<DraftsModalProps> = ({
  isOpen,
  onClose,
  onRequestCustomDraft,
}) => {
  const [selectedDraftId, setSelectedDraftId] = useState(PRESET_DRAFTS[0].id);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentDraft = PRESET_DRAFTS.find((d) => d.id === selectedDraftId) || PRESET_DRAFTS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDraft.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentDraft.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDraft.title.replace(/\s+/g, '_')}_Minuta_Angola.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">description</span>
            </div>
            <div>
              <h2 className="text-base font-semibold font-headline text-slate-900">
                Minutas & Modelos Jurídicos Angolanos
              </h2>
              <p className="text-xs text-slate-500">
                Modelos formais em conformidade com o formalismo e as praxes da advocacia em Angola
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

        {/* Two pane layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Draft Selection List */}
          <div className="w-full md:w-72 border-r border-slate-100 bg-slate-50/70 p-3 overflow-y-auto space-y-1.5 custom-scroll shrink-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Modelos Disponíveis
            </div>
            {PRESET_DRAFTS.map((draft) => (
              <button
                key={draft.id}
                onClick={() => setSelectedDraftId(draft.id)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-colors cursor-pointer flex flex-col gap-1 ${
                  draft.id === selectedDraftId
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-medium'
                    : 'text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold line-clamp-1">{draft.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                    {draft.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">{draft.category}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Draft Preview & Actions */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 font-headline">
                  {currentDraft.title}
                </h3>
                <p className="text-xs text-slate-500">{currentDraft.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copiar texto"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Baixar ficheiro .txt"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  <span className="hidden sm:inline">Baixar</span>
                </button>

                <button
                  onClick={() => {
                    onRequestCustomDraft(currentDraft.title);
                    onClose();
                  }}
                  className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
                  <span>Personalizar com IA</span>
                </button>
              </div>
            </div>

            {/* Content view */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scroll bg-slate-50/40">
              <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                {currentDraft.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
