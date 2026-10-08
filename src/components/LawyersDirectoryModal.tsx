import React, { useState } from 'react';
import { Lawyer } from '../types';
import { INITIAL_LAWYERS } from '../data/legalData';

interface LawyersDirectoryModalProps {
  lawyers: Lawyer[];
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (lawyer: Lawyer) => void;
  onContact: (lawyer: Lawyer) => void;
  onOpenRegistration: () => void;
}

export const LawyersDirectoryModal: React.FC<LawyersDirectoryModalProps> = ({
  lawyers,
  isOpen,
  onClose,
  onSchedule,
  onContact,
  onOpenRegistration,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');

  if (!isOpen) return null;

  const specialties = ['Todas', 'Laboral', 'Comercial', 'Mediação IGT', 'Penal', 'Imobiliário'];

  const filtered = lawyers.filter((l) => {
    const matchesSpec = selectedSpecialty === 'Todas' || l.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.oaaNumber.includes(searchTerm) ||
      l.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.entityType && l.entityType.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSpec && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <h2 className="text-base font-semibold font-headline text-slate-900">
                Directório Oficial da Ordem dos Advogados de Angola (OAA)
              </h2>
              <p className="text-xs text-slate-500">
                Advogados com inscrição activa em vigor, patrocínio forense e salas de mediação em Angola
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                onOpenRegistration();
                onClose();
              }}
              className="h-8 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Cadastrar Jurista / Escritório</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome, cédula OAA, município (ex: Talatona, Ingombota)..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scroll shrink-0">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSpecialty === spec
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Lawyers Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scroll flex-1">
          {filtered.map((lawyer) => (
            <div
              key={lawyer.id}
              className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white shadow-2xs flex flex-col justify-between gap-3 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <img
                    className="w-full h-full object-cover"
                    alt={lawyer.name}
                    src={lawyer.photoUrl}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {lawyer.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {lawyer.entityType && (
                        <span className="text-[9px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {lawyer.entityType === 'Sociedade de Advogados / Escritório' ? 'Sociedade' : 'Advogado'}
                        </span>
                      )}
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        OAA #{lawyer.oaaNumber}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {lawyer.location}
                  </p>
                  <p className="text-xs text-emerald-700 font-medium mt-1">
                    {lawyer.specialty}
                  </p>
                  {lawyer.bio && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug">
                      {lawyer.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Disponível para mandato
                </span>
                <span className="font-mono text-[11px]">{lawyer.phone}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    onSchedule(lawyer);
                    onClose();
                  }}
                  className="flex-1 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>Agendar Consulta</span>
                </button>
                <button
                  onClick={() => {
                    onContact(lawyer);
                  }}
                  className="px-3 h-9 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Contactar directamente"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
              Nenhum advogado encontrado com os filtros selecionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
