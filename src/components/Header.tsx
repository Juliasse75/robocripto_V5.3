import React from 'react';
import { Shield, Lock, Activity, RefreshCw, Cpu, LogOut, CheckCircle2, AlertTriangle, Database, Zap } from 'lucide-react';
import { BotStatus, CapitalState, UserSession } from '../types';

interface HeaderProps {
  botStatus: BotStatus;
  capital: CapitalState;
  userSession: UserSession;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  botStatus,
  capital,
  userSession,
  activeTab,
  setActiveTab,
  onLogout,
  onRefresh,
  isRefreshing,
  onOpenLogin
}) => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-2xl">
      {/* Top Warning Banner if BTC Crash or Funding Rate active */}
      {botStatus.btcCrashAtivo && (
        <div className="bg-red-950/80 backdrop-blur-md border-b border-red-500/30 text-red-200 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span><strong>PROTEÇÃO DE CORRELAÇÃO BTC ATIVADA:</strong> Queda abrupta no BTC ({ (botStatus.btcVar3 * 100).toFixed(2) }%). Novas entradas suspensas temporariamente por segurança!</span>
          </div>
          <span className="bg-red-900/80 text-red-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-red-500/40">V5.3 Defense</span>
        </div>
      )}

      {/* Main Header bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Bot Identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center backdrop-blur-sm">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  RobôCripto <span className="text-emerald-400 font-mono text-sm">V5.3</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-white/10 text-slate-200 border border-white/15 rounded-full backdrop-blur-md">
                  Fogo Livre Blindado
                </span>
                <button
                  onClick={() => setActiveTab('binance')}
                  className="px-2.5 py-0.5 text-[10px] font-bold tracking-wide bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1.5 transition-all shadow-sm shadow-amber-500/10 cursor-pointer"
                  title="Abrir painel da Binance Spot Testnet (Etapa 1)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  TESTNET BINANCE ATIVO
                </button>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${botStatus.isOnline ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-amber-400'}`}></span>
                  {botStatus.statusTexto}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 hidden sm:inline">Meta Semanal: $1.000 / +100%</span>
              </p>
            </div>
          </div>

          {/* Mobile Refresh / Login Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/15 backdrop-blur-md transition-all"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            {userSession.isAuthenticated ? (
              <button
                onClick={onLogout}
                className="p-2 text-red-300 bg-red-950/50 hover:bg-red-900/70 rounded-lg border border-red-500/30 backdrop-blur-md transition-all"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 rounded-lg border border-emerald-500/40 backdrop-blur-md transition-all"
              >
                Entrar
              </button>
            )}
          </div>
        </div>

        {/* Status Indicators & User Profile */}
        <div className="hidden md:flex items-center gap-4">
          {/* Vault quick status badge */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-lg shadow-amber-500/5 backdrop-blur-md">
            <div className="p-1.5 bg-amber-500/15 rounded-lg border border-amber-500/30 text-amber-300">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Lucro no Cofre</div>
              <div className="text-sm font-bold text-amber-300 font-mono">
                ${capital.capitalCofre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Refresh action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/15 backdrop-blur-md transition-all flex items-center gap-2 text-xs font-medium shadow-md"
            title="Atualizar painel"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden lg:inline">Atualizar</span>
          </button>

          {/* User Auth control */}
          {userSession.isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="text-right">
                <div className="text-xs font-semibold text-white flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {userSession.username}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">Autenticado</div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-950/50 rounded-xl border border-white/10 hover:border-red-500/40 transition-all backdrop-blur-md"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Entrar no Painel
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/60 border-t border-white/10 px-4 sm:px-6 lg:px-8 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
              activeTab === 'overview'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Visão Geral & Cofre
          </button>

          <button
            onClick={() => setActiveTab('binance')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
              activeTab === 'binance'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Binance Testnet (Etapa 1)
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
              activeTab === 'audit'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Auditoria 24h & Logs
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
              activeTab === 'radar'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Radar 30 Moedas
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
              activeTab === 'controls'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Simulação & Parâmetros
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
              activeTab === 'integrations'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Railway & Supabase Hub
          </button>
        </div>
      </div>
    </header>
  );
};
