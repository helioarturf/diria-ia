import React, { useState, useEffect } from 'react';
import { DatabaseStatus } from '../types';
import { apiUrl } from '../lib/api';

interface CpanelDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const CpanelDatabaseModal: React.FC<CpanelDatabaseModalProps> = ({ isOpen, onClose, onRefresh }) => {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state for custom MySQL / cPanel credentials
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState('3306');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPassword, setDbPassword] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/db/status'));
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.cpanelUser && !dbName) {
          setDbName(`${data.cpanelUser}_diria`);
          setDbUser(`${data.cpanelUser}_diria`);
        }
      }
    } catch (err: any) {
      console.error('Erro ao buscar status do banco:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleAutoProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisioning(true);
    setFeedback(null);
    try {
      const res = await fetch(apiUrl('/api/db/auto-provision'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host,
          port: Number(port),
          database: dbName,
          user: dbUser,
          password: dbPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: data.message || 'Banco e tabelas provisionados com sucesso no cPanel!',
        });
        setStatus(data);
        if (onRefresh) onRefresh();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || data.details || 'Falha ao conectar ao MySQL. Motor autocontido mantido.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Erro de comunicação com o servidor: ' + err.message,
      });
    } finally {
      setProvisioning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <span className="material-symbols-outlined text-[24px]">database</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Banco Autocontido & Gestor cPanel</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Zero Intervenção
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Provisionamento automático de banco MySQL no cPanel com fallback autocontido resiliente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scroll space-y-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-850 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  status?.connected
                    ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                    : 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                } animate-pulse`}
              />
              <div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Modo Activo do Banco</div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>
                    {status?.mode === 'mysql'
                      ? 'MySQL / MariaDB cPanel'
                      : 'Motor Autocontido Integrado (Zero Config)'}
                  </span>
                  <span className="text-xs font-normal text-emerald-400">
                    {status?.connected ? '• Operacional' : '• Aguardando Conexão'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{status?.message}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={fetchStatus}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition flex items-center gap-1.5"
              >
                <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>Actualizar Status</span>
              </button>
            </div>
          </div>

          {/* Feedback alert */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs border flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/70 border-amber-500/40 text-amber-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">
                {feedback.type === 'success' ? 'check_circle' : 'info'}
              </span>
              <div>
                <div className="font-semibold mb-0.5">
                  {feedback.type === 'success' ? 'Operação Concluída com Sucesso' : 'Nota de Execução'}
                </div>
                <div>{feedback.message}</div>
              </div>
            </div>
          )}

          {/* Metrics & Collections Grid */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">schema</span>
              <span>Tabelas & Registos Provisionados</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
                <div className="text-slate-400 text-[11px]">Tabelas SQL</div>
                <div className="text-lg font-bold text-white mt-1">{status?.tablesCount || 0}</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Esquema Activo</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
                <div className="text-slate-400 text-[11px]">Advogados OAA</div>
                <div className="text-lg font-bold text-white mt-1">
                  {status?.recordsSummary?.lawyers || 0}
                </div>
                <div className="text-[10px] text-amber-400 mt-0.5">Directório Inicial</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
                <div className="text-slate-400 text-[11px]">Consultas & Minutas</div>
                <div className="text-lg font-bold text-white mt-1">
                  {(status?.recordsSummary?.consultations || 0) + (status?.recordsSummary?.documents || 0)}
                </div>
                <div className="text-[10px] text-blue-400 mt-0.5">Registos Prontos</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
                <div className="text-slate-400 text-[11px]">Ambiente cPanel</div>
                <div className="text-lg font-bold text-white mt-1 truncate">
                  {status?.cpanelUser ? status.cpanelUser : 'Detectado'}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Compatível</div>
              </div>
            </div>
          </div>

          {/* Auto-Provision Form */}
          <div className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-[18px]">bolt</span>
                  <span>Provisionar Banco MySQL no cPanel sem phpMyAdmin</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  O DirIA cria automaticamente o banco de dados, gera as tabelas DDL e popula os registos iniciais.
                </p>
              </div>
            </div>

            <form onSubmit={handleAutoProvision} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Host MySQL</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost ou 127.0.0.1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Porta MySQL</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="3306"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome do Banco {status?.cpanelUser ? `(Prefixo cPanel: ${status.cpanelUser}_)` : ''}
                  </label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    placeholder={status?.cpanelUser ? `${status.cpanelUser}_diria` : 'diria_angola'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Utilizador MySQL</label>
                  <input
                    type="text"
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    placeholder={status?.cpanelUser ? `${status.cpanelUser}_diria` : 'root'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Senha do Utilizador MySQL</label>
                <input
                  type="password"
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  placeholder="Palavra-passe definida no cPanel ou no MySQL"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={provisioning}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[18px] ${provisioning ? 'animate-spin' : ''}`}>
                    {provisioning ? 'progress_activity' : 'play_circle'}
                  </span>
                  <span>{provisioning ? 'Criando Banco & Migrações...' : 'Executar Auto-Criação no cPanel Agora'}</span>
                </button>

                <a
                  href={apiUrl('/api/db/schema-sql')}
                  download="diria_cpanel_schema.sql"
                  className="px-4 py-2.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Descarregar Dump SQL</span>
                </a>
              </div>
            </form>
          </div>

          {/* cPanel Terminal & PHP helper scripts info */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/60">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[16px]">terminal</span>
              <span>Ficheiros Autocontidos Inclusos no Directório</span>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-400 font-semibold">cpanel-setup.sh</span>
                  <span>— Script bash para o Terminal do cPanel (criação via UAPI automática)</span>
                </div>
                <code className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  bash cpanel-setup.sh
                </code>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-semibold">cpanel_auto_setup.php</span>
                  <span>— Instalador web standalone para aceder via URL</span>
                </div>
                <code className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  /cpanel_auto_setup.php
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">verified_user</span>
            <span>Segurança garantida: Tabelas criadas com charset utf8mb4 e InnoDB.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
