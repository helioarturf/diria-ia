import React, { useState, useEffect } from 'react';
import { DatabaseStatus } from '../types';
import { apiUrl } from '../lib/api';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenLegalBases?: () => void;
  onOpenLawyersDirectory?: () => void;
  onOpenCalculator?: () => void;
  onOpenDrafts?: () => void;
  onOpenRegistration?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenCpanelModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenLegalBases,
  onOpenLawyersDirectory,
  onOpenCalculator,
  onOpenDrafts,
  onOpenRegistration,
  onOpenAuth,
  onOpenCpanelModal,
}) => {
  const [activeTab, setActiveTab] = useState<'labor' | 'rental' | 'business' | 'tax'>('labor');
  const [calcSalary, setCalcSalary] = useState<number>(350000);
  const [calcYears, setCalcYears] = useState<number>(5);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Fetch live DB status to display the cPanel badge
  useEffect(() => {
    fetch(apiUrl('/api/db/status'))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDbStatus(data);
      })
      .catch(() => {});
  }, []);

  // Quick simulation formula according to Lei 12/23
  const compensationEstimated = Math.round(calcSalary * calcYears);
  const noticeEstimated = Math.round(calcSalary);
  const totalEstimated = compensationEstimated + noticeEstimated;

  const mockDemos = {
    labor: {
      category: 'Direito Laboral — Lei Geral do Trabalho (Lei 12/23)',
      question: 'Fui despedido sem justa causa nem aviso prévio após 4 anos de serviço em Luanda. Quais são os meus direitos?',
      opinion:
        'A cessação contratual promovida pelo empregador sem pré-aviso nem justa causa comprovada constitui despedimento ilícito sob o Art.º 232.º da Lei 12/23, conferindo compensação por antiguidade (salário-base multiplicado pelo coeficiente temporal) acrescida da indemnização substitutiva de pré-aviso de 30 dias, férias proporcionais e subsídio de Natal.',
      article: 'Artigo 232.º da Lei n.º 12/23',
      actionTitle: 'Procedimento Recomendado',
      actionText: 'Interpelação avulsa ou reclamação junto da Inspecção Geral do Trabalho (IGT) para mediação conciliatória.',
      badge: 'Complexidade Elevada',
    },
    rental: {
      category: 'Direito Imobiliário & Arrendamento Urbano (Lei 26/15)',
      question: 'O senhorio exigiu 6 meses de caução e ameaçou despejar-me em 5 dias sem ordem judicial. Isto é legal?',
      opinion:
        'Não. O Regime Jurídico do Arrendamento Urbano (Lei n.º 26/15) limita estritamente as garantias e impõe prazos de denúncia obrigatórios. Qualquer despejo forçado sem prévio título executivo e mandado emitido pela Sala do Cível do Tribunal de Comarca constitui esbulho violento e ilícito civil.',
      article: 'Lei n.º 26/15 & Artigo 1022.º do Código Civil',
      actionTitle: 'Procedimento Recomendado',
      actionText: 'Notificação extrajudicial ao senhorio e providência cautelar de restituição provisória de posse se necessário.',
      badge: 'Protecção do Inquilino',
    },
    business: {
      category: 'Direito Comercial & Guichet Único (Lei 1/04)',
      question: 'Quais os passos legais para constituição rápida de Sociedade por Quotas unipessoal em Luanda?',
      opinion:
        'A constituição realiza-se perante o Guichet Único da Empresa (GUE) ou Conservatória do Registo Comercial. Exige obtenção da Certidão de Admissibilidade de Firma, redacção do Pacto Social com identificação das quotas e nomeação da gerência, seguida de registo comercial e inscrição fiscal na AGT.',
      article: 'Lei das Sociedades Comerciais (Lei n.º 1/04)',
      actionTitle: 'Procedimento Recomendado',
      actionText: 'Utilizar minutas de pacto social pré-validadas e submeter ao balcão único presencial ou electrónico do GUE.',
      badge: 'Empresarial & GUE',
    },
    tax: {
      category: 'Direito Fiscal & Contencioso Tributário (Lei 21/14)',
      question: 'A AGT emitiu liquidação oficiosa de IRT com valores incorretos. Como contestar?',
      opinion:
        'Nos termos do Código Geral Tributário (Lei n.º 21/14), o contribuinte tem o direito de deduzir Reclamação Graciosa perante a Repartição Fiscal competente no prazo legal. Não havendo deferimento, cabe Recurso Hierárquico ou Impugnação Judicial perante a Sala do Contencioso Fiscal e Aduaneiro.',
      article: 'Artigos 112.º e seguintes da Lei n.º 21/14',
      actionTitle: 'Procedimento Recomendado',
      actionText: 'Juntar comprovativos de retenção na fonte e mapa de remunerações para sustentar a anulação do acto tributário.',
      badge: 'Defesa Tributária AGT',
    },
  };

  const currentDemo = mockDemos[activeTab];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* GLOW BACKGROUND ACCENTS */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* TOP NOTIFICATION / BANNER */}
      <aside aria-label="Aviso institucional" className="bg-gradient-to-r from-amber-600/20 via-slate-900 to-amber-600/20 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-200/90 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          <strong>DirIA Angola 2026:</strong> Alinhada à Constituição revista (Lei 18/21), Lei Geral do Trabalho (Lei 12/23) e Código Penal (Lei 38/20).
        </span>
        <button
          onClick={onOpenCpanelModal}
          className="ml-3 hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
        >
          <span>Instalador cPanel Zero-Config</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </aside>

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#070b14]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <span className="material-symbols-outlined text-[24px]">gavel</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-headline">DirIA</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                  Angola
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Inteligência Jurídica</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#solucoes" className="hover:text-amber-400 transition">
              Soluções
            </a>
            <a href="#areas" className="hover:text-amber-400 transition">
              Áreas do Direito
            </a>
            <a href="#calculadora" className="hover:text-amber-400 transition">
              Calculadora Lei 12/23
            </a>
            <a href="#cpanel-infra" className="hover:text-amber-400 transition flex items-center gap-1 text-amber-400">
              <span className="material-symbols-outlined text-[15px]">database</span>
              <span>Banco cPanel</span>
            </a>
            <a href="#planos" className="hover:text-amber-400 transition">
              Planos & Preços
            </a>
            <a href="#faq" className="hover:text-amber-400 transition">
              Perguntas Frequentes
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {/* cPanel Live Status Pill */}
            <button
              onClick={onOpenCpanelModal}
              title="Verificar estado do banco cPanel"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:border-amber-500/60 hover:text-white transition"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.connected ? 'bg-emerald-400' : 'bg-amber-400'
                } animate-pulse`}
              />
              <span className="text-[11px] font-mono">
                {dbStatus?.mode === 'mysql' ? 'MySQL cPanel' : 'Banco Autocontido'}
              </span>
            </button>

            {onOpenAuth && (
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden md:inline-flex px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Iniciar Sessão
              </button>
            )}

            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Aceder à Aplicação</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-medium shadow-inner">
                <span className="material-symbols-outlined text-[16px] text-amber-400">verified</span>
                <span>Plataforma Oficial de Inteligência Jurídica Angolana</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-headline">
                Inteligência Artificial Forense{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                  Moldada ao Direito de Angola.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Pareceres jurídicos fundamentados no Diário da República, cálculo automático de indemnizações pela Lei
                12/23, elaboração imediata de minutas forenses e encaminhamento para advogados inscritos na Ordem dos
                Advogados de Angola (OAA).
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onEnterApp}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  <span>Iniciar Consulta Jurídica Grátis</span>
                </button>

                <button
                  onClick={onOpenCpanelModal}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px] text-amber-400">database</span>
                  <span>Instalador cPanel Zero-Touch</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl font-extrabold text-white font-headline">100%</span>
                  <span className="text-xs text-slate-400">Leis Angolanas Vigentes</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl font-extrabold text-amber-400 font-headline">18</span>
                  <span className="text-xs text-slate-400">Províncias & Comarcas</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl font-extrabold text-emerald-400 font-headline">&lt; 3s</span>
                  <span className="text-xs text-slate-400">Geração de Parecer</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl font-extrabold text-blue-400 font-headline">OAA</span>
                  <span className="text-xs text-slate-400">Directório de Patronos</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Showcase / Simulator */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-75" />
                <div className="relative bg-[#0d1527] border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Mock Window Topbar */}
                  <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="text-xs font-mono text-slate-400 ml-2">DirIA Angola — Parecer em Tempo Real</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      CRA 2010/2021
                    </span>
                  </div>

                  {/* Interactive Selector Tabs */}
                  <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1 overflow-x-auto text-xs">
                    <button
                      onClick={() => setActiveTab('labor')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                        activeTab === 'labor'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Laboral (Lei 12/23)
                    </button>
                    <button
                      onClick={() => setActiveTab('rental')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                        activeTab === 'rental'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Arrendamento (Lei 26/15)
                    </button>
                    <button
                      onClick={() => setActiveTab('business')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                        activeTab === 'business'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Sociedades (GUE)
                    </button>
                    <button
                      onClick={() => setActiveTab('tax')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                        activeTab === 'tax'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      AGT / Fiscal
                    </button>
                  </div>

                  {/* Live Simulation Card Body */}
                  <div className="p-5 space-y-4">
                    {/* User Question */}
                    <div className="flex items-start gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">Consulta do Utente (Luanda):</div>
                        <p className="text-xs text-white font-medium mt-0.5">{currentDemo.question}</p>
                      </div>
                    </div>

                    {/* DirIA Legal Opinion Response */}
                    <div className="flex items-start gap-3 bg-gradient-to-br from-amber-500/5 to-slate-900/90 p-4 rounded-xl border border-amber-500/20">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">balance</span>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                            Parecer Preliminar DirIA
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {currentDemo.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{currentDemo.opinion}</p>

                        {/* Citation Card */}
                        <div className="bg-slate-950/70 border-l-2 border-amber-400 p-2.5 rounded-r-lg text-[11px]">
                          <div className="font-semibold text-amber-300">{currentDemo.article}</div>
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            Fonte Oficial: Diário da República de Angola (I Série)
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="pt-1 text-[11px] text-slate-300">
                          <strong className="text-white">{currentDemo.actionTitle}:</strong> {currentDemo.actionText}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Button */}
                    <button
                      onClick={onEnterApp}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 border border-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <span>Abrir esta consulta no assistente completo</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE SOLUTIONS SECTION */}
      <section id="solucoes" className="py-20 px-4 sm:px-8 border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Funcionalidades Avançadas
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-headline">
              Tudo o que precisa para actuar com precisão jurídica em Angola.
            </h2>
            <p className="text-sm text-slate-400">
              Desenvolvida para atender desde o cidadão comum que busca esclarecer direitos até juízes, advogados patronos
              e departamentos corporativos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <span className="material-symbols-outlined text-[26px]">calculate</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-headline">Calculadora Laboral (Lei 12/23)</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Simulação minuciosa de indemnização por cessação contratual, aviso prévio, proporcionais de férias e subsídio
                de Natal conforme as tabelas vigentes e Decreto Presidencial n.º 109/24.
              </p>
              <button
                onClick={onOpenCalculator}
                className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:gap-2 transition"
              >
                <span>Calcular Indemnização</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <span className="material-symbols-outlined text-[26px]">edit_document</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-headline">Gerador Inteligente de Minutas</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Emissão instantânea de contratos de trabalho, arrendamento urbano (Lei 26/15), pactos sociais para o GUE,
                notificações avulsas e autos de queixa para a IGT com cabeçalho oficial.
              </p>
              <button
                onClick={onOpenDrafts}
                className="text-xs font-semibold text-blue-400 flex items-center gap-1 group-hover:gap-2 transition"
              >
                <span>Gerar Minuta Jurídica</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <span className="material-symbols-outlined text-[26px]">policy</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-headline">Auditoria de Contratos & Riscos</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Carregue contratos, cartas de despedimento ou regulamentos internos para detecção de nulidades, cláusulas
                abusivas e conformidade com o Código Civil e Laboral.
              </p>
              <button
                onClick={onEnterApp}
                className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition"
              >
                <span>Auditar Documento</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <span className="material-symbols-outlined text-[26px]">badge</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-headline">Directório de Advogados OAA</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Rede de advogados patronos com cédula profissional validada pela Ordem dos Advogados de Angola, com filtros
                por província (Luanda, Benguela, Huambo) e especialidade forense.
              </p>
              <button
                onClick={onOpenLawyersDirectory}
                className="text-xs font-semibold text-purple-400 flex items-center gap-1 group-hover:gap-2 transition"
              >
                <span>Consultar Directório</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <span className="material-symbols-outlined text-[26px]">menu_book</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-headline">Base Legal & Diários da República</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Consulta sistematizada da CRA, Código Penal (Lei 38/20), Processo Penal (Lei 39/20), Código Comercial e
                diplomas fiscais actualizados sem necessidade de navegar em PDFs complexos.
              </p>
              <button
                onClick={onOpenLegalBases}
                className="text-xs font-semibold text-rose-400 flex items-center gap-1 group-hover:gap-2 transition"
              >
                <span>Explorar Base Legal</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Card 6: cPanel Auto-Contida */}
            <div className="bg-slate-900/60 border border-amber-500/40 rounded-2xl p-6 hover:border-amber-400 transition-all duration-300 group hover:-translate-y-1 shadow-xl relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Auto-Contida
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <span className="material-symbols-outlined text-[26px]">database</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-headline">Auto-Criação de Banco no cPanel</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                A aplicação instala-se de forma 100% autocontida. Cria o banco de dados MySQL no cPanel automaticamente,
                gera as 8 tabelas e migrações sem exigir comandos manuais ou phpMyAdmin.
              </p>
              <button
                onClick={onOpenCpanelModal}
                className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:gap-2 transition"
              >
                <span>Gerir Banco cPanel</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INTERACTIVE LABOR CALCULATOR ON LANDING PAGE */}
      <section id="calculadora" className="py-20 px-4 sm:px-8 relative">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#0e172e] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">calculate</span>
                <span>Simulador Preliminar Lei 12/23</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-headline">
                Simule a sua compensação laboral em segundos.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Experimente directamente os parâmetros estabelecidos pelo artigo 232.º da Lei Geral do Trabalho de
                Angola para despedimento sem justa causa promovido pelo empregador.
              </p>

              {/* Interactive Inputs */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Salário-Base Mensal (AOA):</span>
                    <span className="font-mono font-bold text-amber-400">{calcSalary.toLocaleString('pt-AO')} Kz</span>
                  </div>
                  <input
                    type="range"
                    min="70000"
                    max="3000000"
                    step="25000"
                    value={calcSalary}
                    onChange={(e) => setCalcSalary(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Anos Efectivos de Serviço:</span>
                    <span className="font-mono font-bold text-amber-400">{calcYears} Anos</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={calcYears}
                    onChange={(e) => setCalcYears(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Quick Result Display */}
            <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Estimativa Preliminar de Créditos
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-300 py-1.5 border-b border-slate-800/80">
                  <span>Indemnização por Antiguidade ({calcYears} anos):</span>
                  <span className="font-mono font-semibold text-white">
                    {compensationEstimated.toLocaleString('pt-AO')} Kz
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300 py-1.5 border-b border-slate-800/80">
                  <span>Aviso Prévio (30 dias sem notificação):</span>
                  <span className="font-mono font-semibold text-white">
                    {noticeEstimated.toLocaleString('pt-AO')} Kz
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white pt-2">
                  <span className="text-amber-400">Total Bruto Estimado:</span>
                  <span className="font-mono text-xl text-amber-400">
                    {totalEstimated.toLocaleString('pt-AO')} Kz
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenCalculator}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>Abrir Calculadora Completa (com Férias e IRT)</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CPANEL ZERO-TOUCH ARCHITECTURE SECTION */}
      <section id="cpanel-infra" className="py-20 px-4 sm:px-8 border-t border-slate-800/80 bg-[#090f1d]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
              <span>Deploy Autocontido em Hospedagem</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-headline">
              Criada para rodar no cPanel sem intervenção manual.
            </h2>
            <p className="text-sm text-slate-300">
              Esqueça comandos complexos, phpMyAdmin ou criação manual de utilizadores. A DirIA Angola detecta o cPanel e
              auto-provisiona tudo no primeiro acesso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">auto_mode</span>
              </div>
              <h3 className="text-base font-bold text-white font-headline">1. Auto-Detecção do Ambiente</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ao subir os ficheiros para a raiz ou subdomínio do cPanel, a aplicação identifica o utilizador cPanel do
                sistema e monta o nome do banco (<code className="text-amber-400">cpaneluser_diria</code>).
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">schema</span>
              </div>
              <h3 className="text-base font-bold text-white font-headline">2. Migrações DDL e Seeds</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cria automaticamente as tabelas MySQL InnoDB em <code className="text-amber-400">utf8mb4</code> e popula o
                directório inicial de advogados, diplomas da OAA e minutas de modelo angolano.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <h3 className="text-base font-bold text-white font-headline">3. Fallback Autocontido Resiliente</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Caso o MySQL não esteja configurado no momento, a DirIA mantém a operação perfeita através do motor
                autocontido JSON local. Zero downtime e zero falhas de ecrã branco.
              </p>
            </div>
          </div>

          {/* Action to open cPanel manager */}
          <div className="text-center pt-4">
            <button
              onClick={onOpenCpanelModal}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold inline-flex items-center gap-2 transition"
            >
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span>Abrir Painel de Gestão e Teste do Banco cPanel</span>
            </button>
          </div>
        </div>
      </section>

      {/* PLANS & PRICING */}
      <section id="planos" className="py-20 px-4 sm:px-8 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Acesso Acessível</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-headline">
              Planos transparentes cotados em Kwanzas (AOA).
            </h2>
            <p className="text-sm text-slate-400">
              Acesso democrático ao direito angolano para cidadãos e ferramentas de alta produtividade forense para
              escritórios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Utente Grátis */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cidadão / Utente</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-white font-headline">0</span>
                  <span className="text-sm font-semibold text-slate-400">AOA / Gratuito</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Para indivíduos que necessitam de esclarecer os seus direitos básicos e emitir consultas pontuais.
                </p>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                    <span>Consultas em Direito Laboral e Arrendamento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                    <span>Calculadora básica de pré-aviso</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                    <span>Acesso ao Directório de Advogados OAA</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={onEnterApp}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                >
                  Começar Gratuitamente
                </button>
              </div>
            </div>

            {/* Jurista Pro (Featured) */}
            <div className="bg-gradient-to-b from-slate-900 to-[#101b38] border-2 border-amber-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold uppercase tracking-wider">
                Mais Popular
              </div>

              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Advogado / Jurista</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-white font-headline">15.000</span>
                  <span className="text-sm font-semibold text-slate-400">AOA / mês</span>
                </div>
                <p className="text-xs text-slate-300 mb-6">
                  Produtividade forense máxima para advogados singulares, estagiários e estudantes de direito.
                </p>

                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    <span>Todas as funcionalidades do plano Cidadão</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    <span>Elaboração de minutas forenses sem limite</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    <span>Auditoria de contratos e cláusulas nulas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">check_circle</span>
                    <span>Exportação para Word / PDF formal</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={onEnterApp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition"
                >
                  Aceder como Jurista Pro
                </button>
              </div>
            </div>

            {/* Sociedades / Corporate */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sociedades & Empresas</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-white font-headline">45.000</span>
                  <span className="text-sm font-semibold text-slate-400">AOA / mês</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Para sociedades de advogados, departamentos de recursos humanos e gestores de conformidade legal.
                </p>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                    <span>Multi-utilizador (até 10 patronos)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                    <span>Portal do Escritório com agenda de audiências</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                    <span>Banco de dados MySQL dedicado em cPanel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                    <span>Apoio prioritário e treino de equipa</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={onEnterApp}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                >
                  Contactar Comercial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Dúvidas Frequentes</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-headline">
              Perguntas e Respostas sobre a DirIA Angola.
            </h2>
          </div>

          <div className="space-y-4">
            <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs open:border-amber-500/40">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                <span>A DirIA substitui a consulta presencial com um Advogado da OAA?</span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-slate-300 leading-relaxed">
                Não. A DirIA fornece pareceres jurídicos preliminares, fundamentação nos diplomas legais e elaboração de
                minutas de trabalho. Para representação perante tribunais ou formalização definitiva de actos forenses, a
                plataforma integra um directório directo para contratação de advogados credenciados pela Ordem dos Advogados
                de Angola.
              </p>
            </details>

            <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs open:border-amber-500/40">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                <span>Como funciona a auto-criação do banco de dados no cPanel?</span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-slate-300 leading-relaxed">
                O sistema é autocontido. Ao iniciar no cPanel através do Node.js Selector ou Passenger, o servidor tenta
                automaticamente criar a base de dados MySQL (<code className="text-amber-400">cpaneluser_diria</code>) e as
                tabelas relacionais. Caso o MySQL não esteja ainda configurado, o motor local em JSON mantém toda a
                aplicação funcional sem apresentar qualquer erro de ecrã branco.
              </p>
            </details>

            <details className="group bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs open:border-amber-500/40">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                <span>As leis citadas estão actualizadas com os últimos Diários da República?</span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-slate-300 leading-relaxed">
                Sim. A base de dados jurídica da DirIA contempla expressamente a Constituição da República de Angola
                revista pela Lei n.º 18/21, a nova Lei Geral do Trabalho (Lei n.º 12/23), os novos Códigos Penal e de
                Processo Penal (Leis 38/20 e 39/20) e as recentes actualizações tributárias da AGT.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-[#05080f] px-4 sm:px-8 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                ⚖️
              </div>
              <span className="font-bold text-white text-base font-headline">DirIA Angola</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Plataforma de inteligência jurídica de referência para a República de Angola. Desenvolvida para aproximar a
              justiça e dinamizar a prática forense nacional.
            </p>
          </div>

          <div>
            <div className="font-bold text-white mb-3">Módulos & Recursos</div>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={onOpenCalculator} className="hover:text-amber-400 transition">
                  Calculadora Laboral (Lei 12/23)
                </button>
              </li>
              <li>
                <button onClick={onOpenDrafts} className="hover:text-amber-400 transition">
                  Gerador de Minutas Forenses
                </button>
              </li>
              <li>
                <button onClick={onOpenLegalBases} className="hover:text-amber-400 transition">
                  Base Legislativa & CRA
                </button>
              </li>
              <li>
                <button onClick={onOpenLawyersDirectory} className="hover:text-amber-400 transition">
                  Directório de Patronos OAA
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-3">Ambiente & Instalação</div>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={onOpenCpanelModal} className="hover:text-amber-400 transition flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Estado do Banco cPanel</span>
                </button>
              </li>
              <li>
                <a href="/cpanel_auto_setup.php" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">
                  Instalador PHP Standalone
                </a>
              </li>
              <li>
                <a href={apiUrl('/api/db/schema-sql')} download="diria_cpanel_schema.sql" className="hover:text-amber-400 transition">
                  Descarregar Esquema SQL (MySQL 8)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-3">Conformidade Legal</div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Em cumprimento das normas deontológicas da Ordem dos Advogados de Angola (Decreto n.º 28/96). A DirIA presta
              esclarecimentos informativos e pareceres preparatórios.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>© {new Date().getFullYear()} DirIA Angola. Todos os direitos reservados. República de Angola.</div>
          <div className="flex items-center gap-4">
            <button onClick={onEnterApp} className="text-amber-400 hover:underline">
              Entrar na Aplicação Web
            </button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white">
              Voltar ao topo ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
