import React, { useState } from 'react';
import { calculateAngolaLaborCredits, formatAOA } from '../utils/laborCalculator';

interface LaborCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertInChat?: (calculationSummary: string) => void;
}

export const LaborCalculatorModal: React.FC<LaborCalculatorModalProps> = ({
  isOpen,
  onClose,
  onInsertInChat,
}) => {
  const [salary, setSalary] = useState<number>(250000);
  const [years, setYears] = useState<number>(4);
  const [months, setMonths] = useState<number>(0);
  const [noticeGiven, setNoticeGiven] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const result = calculateAngolaLaborCredits({
    monthlySalary: Number(salary) || 0,
    yearsOfService: Number(years) || 0,
    monthsOfService: Number(months) || 0,
    noticeGiven,
  });

  const getSummaryText = () => {
    return `[SIMULAÇÃO DE CRÉDITOS LABORAIS - LEI N.º 12/23 DE ANGOLA]
• Salário Base: ${formatAOA(result.monthlySalary)}
• Antiguidade: ${result.yearsOfService} ano(s) e ${result.monthsOfService} mês(es)
• Aviso Prévio: ${noticeGiven ? 'Cumprido' : 'Em falta (Devido)'}
---
1. Compensação por Antiguidade (Art. 236.º): ${formatAOA(result.compensationAmount)}
2. Salário de Aviso Prévio em Falta (Art. 208.º/232.º): ${formatAOA(result.noticeAmount)}
3. Férias Proporcionais: ${formatAOA(result.holidaysProportional)}
4. Subsídio de Férias Proporcional: ${formatAOA(result.holidayAllowance)}
5. Subsídio de Natal Proporcional: ${formatAOA(result.christmasAllowance)}
---
• TOTAL BRUTO: ${formatAOA(result.grossTotal)}
• Dedução INSS (3%): ${formatAOA(result.inssDeduction)}
• IRT Estimado: ${formatAOA(result.estimatedIrt)}
• TOTAL LÍQUIDO ESTIMADO: ${formatAOA(result.netTotal)}
Fundamento: ${result.legalBasis}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = () => {
    if (onInsertInChat) {
      onInsertInChat(`Gostaria de analisar esta simulação de cálculo laboral:\n${getSummaryText()}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">calculate</span>
            </div>
            <div>
              <h2 className="text-base font-semibold font-headline text-slate-900">
                Calculadora de Indemnização & Créditos Laborais
              </h2>
              <p className="text-xs text-slate-500">
                Fórmula oficial baseada na Lei Geral do Trabalho de Angola (Lei n.º 12/23)
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scroll flex-1">
          {/* Inputs grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salário Base Mensal (Kwanzas - AOA)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  Kz
                </span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Anos Completos de Serviço
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meses Adicionais (0 a 11)
              </label>
              <input
                type="number"
                min="0"
                max="11"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Aviso Prévio pelo Empregador
              </label>
              <select
                value={noticeGiven ? 'sim' : 'nao'}
                onChange={(e) => setNoticeGiven(e.target.value === 'sim')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="nao">Não cumpriu (Devido em dinheiro)</option>
                <option value="sim">Sim, trabalhou com pré-aviso</option>
              </select>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Discriminação dos Créditos
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Lei 12/23
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Compensação por Antiguidade (Art. 236.º):</span>
                <span className="font-semibold font-mono">{formatAOA(result.compensationAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Salário de Aviso Prévio em Falta (Art. 208.º/232.º):</span>
                <span className="font-semibold font-mono">{formatAOA(result.noticeAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Férias Proporcionais Vencidas:</span>
                <span className="font-semibold font-mono">{formatAOA(result.holidaysProportional)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Subsídio de Férias Proporcional (100%):</span>
                <span className="font-semibold font-mono">{formatAOA(result.holidayAllowance)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Subsídio de Natal Proporcional:</span>
                <span className="font-semibold font-mono">{formatAOA(result.christmasAllowance)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-medium">
                <span>Total Bruto Apurado:</span>
                <span className="font-semibold font-mono">{formatAOA(result.grossTotal)}</span>
              </div>

              <div className="flex justify-between text-rose-700 text-[11px]">
                <span>Desconto Segurança Social (INSS 3%):</span>
                <span className="font-mono">-{formatAOA(result.inssDeduction)}</span>
              </div>
              <div className="flex justify-between text-rose-700 text-[11px]">
                <span>Retenção Estimada de IRT:</span>
                <span className="font-mono">-{formatAOA(result.estimatedIrt)}</span>
              </div>
            </div>

            {/* Total Net highlight */}
            <div className="pt-3 border-t border-slate-300/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block font-headline">
                  Total Líquido Estimado a Receber
                </span>
                <span className="text-[10px] text-slate-500">
                  Sujeito a conferência de faltas e adicionais
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {formatAOA(result.netTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={handleCopy}
            className="h-9 px-4 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copiado!' : 'Copiar Discriminação'}</span>
          </button>

          <button
            onClick={handleSendToChat}
            className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>Inserir no Chat com a DirIA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
