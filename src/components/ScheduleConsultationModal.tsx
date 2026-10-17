import React, { useState } from 'react';
import { Lawyer, ConsultationRequest } from '../types';

interface ScheduleConsultationModalProps {
  lawyer: Lawyer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRequestCreated?: (request: ConsultationRequest) => void;
}

export const ScheduleConsultationModal: React.FC<ScheduleConsultationModalProps> = ({
  lawyer,
  isOpen,
  onClose,
  onSuccess,
  onRequestCreated,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [modality, setModality] = useState<'Presencial' | 'Videoconferência (Online)'>('Presencial');
  const [briefSubject, setBriefSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen || !lawyer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    if (!clientName || !clientPhone) {
      setValidationError('Por favor, preencha o seu nome e contacto telefónico.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRequest: ConsultationRequest = {
        id: `req-${Date.now()}`,
        lawyerId: lawyer.id,
        lawyerName: lawyer.name,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        preferredDate: preferredDate || 'A combinar',
        modality,
        subject: briefSubject.trim() || 'Consulta geral sobre legislação angolana',
        status: 'Pendente',
        createdAt: 'Hoje',
      };

      if (onRequestCreated) {
        onRequestCreated(newRequest);
      }

      setIsSubmitting(false);
      onSuccess(`Pedido de agendamento enviado com sucesso para ${lawyer.name}! O pedido já está visível no Painel do Advogado.`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
              <img
                className="w-full h-full object-cover"
                alt={lawyer.name}
                src={lawyer.photoUrl}
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold font-headline text-slate-900">
                Agendar com {lawyer.name}
              </h2>
              <p className="text-xs text-slate-500">
                Cédula OAA n.º {lawyer.oaaNumber} • {lawyer.location}
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nome Completo do Mandante / Cliente *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Artur Ferreira"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contacto Telefónico (Angola) *
              </label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+244 9..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Data Pretendida
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Modalidade da Consulta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModality('Presencial')}
                className={`py-2 px-3 rounded-xl border text-center transition-colors cursor-pointer ${
                  modality === 'Presencial'
                    ? 'border-slate-900 bg-slate-900 text-white font-medium'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Escritório Presencial
              </button>
              <button
                type="button"
                onClick={() => setModality('Videoconferência (Online)')}
                className={`py-2 px-3 rounded-xl border text-center transition-colors cursor-pointer ${
                  modality === 'Videoconferência (Online)'
                    ? 'border-slate-900 bg-slate-900 text-white font-medium'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Videoconferência
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Breve Resumo do Assunto / Caso
            </label>
            <textarea
              rows={3}
              value={briefSubject}
              onChange={(e) => setBriefSubject(e.target.value)}
              placeholder="Ex: Despedimento sem aviso prévio, retenção de carteira de trabalho e cálculo de indemnização."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          {validationError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {validationError}
            </div>
          )}

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
            As consultas jurídicas e patrocínio forense são regulados pelo Estatuto da Ordem dos Advogados de Angola e normas de sigilo profissional.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <span>A enviar...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Confirmar Agendamento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
