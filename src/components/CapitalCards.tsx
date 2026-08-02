import React from 'react';
import { Lock, Wallet, ArrowUpRight, DollarSign, ShieldAlert, Sparkles, PieChart, Info, ArrowDownLeft } from 'lucide-react';
import { CapitalState } from '../types';

interface CapitalCardsProps {
  capital: CapitalState;
  onOpenSweepModal: () => void;
}

export const CapitalCards: React.FC<CapitalCardsProps> = ({ capital, onOpenSweepModal }) => {
  const capInicial = !isNaN(Number(capital.capitalInicial)) && Number(capital.capitalInicial) > 0 ? Number(capital.capitalInicial) : 1000;
  const capNeg = !isNaN(Number(capital.capitalEmNegociacao)) ? Number(capital.capitalEmNegociacao) : 0;
  const capLivre = !isNaN(Number(capital.capitalLivre)) ? Number(capital.capitalLivre) : capInicial;
  const capCofre = !isNaN(Number(capital.capitalCofre)) ? Number(capital.capitalCofre) : 0;
  const patTotal = !isNaN(Number(capital.patrimonioTotal)) ? Number(capital.patrimonioTotal) : (capLivre + capNeg + capCofre);
  const tiro = !isNaN(Number(capital.tiroDinamico)) ? Number(capital.tiroDinamico) : 50;
  const pnl24h = !isNaN(Number(capital.pnl24h)) ? Number(capital.pnl24h) : 0;
  const winRate24h = !isNaN(Number(capital.winRate24h)) ? Number(capital.winRate24h) : 0;
  const totalTrades24h = !isNaN(Number(capital.totalTrades24h)) ? Number(capital.totalTrades24h) : 0;

  const totalCaixaAtivo = (capLivre + capNeg) > 0 ? (capLivre + capNeg) : capInicial;
  const percNegociacao = Math.min(100, Math.max(0, (capNeg / totalCaixaAtivo) * 100));
  const percLivre = Math.min(100, Math.max(0, (capLivre / capInicial) * 100));
  const percCofre = Math.min(100, Math.max(0, (capCofre / capInicial) * 100));

  const isVaultPopulated = capCofre > 0;
  const isGatilho40Active = capital.gatilho40Ativado;

  return (
    <div className="space-y-4">
      {/* Gatilho +40% Active Protection Alert Banner */}
      {isGatilho40Active && (
        <div className="bg-emerald-950/60 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-200 shadow-xl shadow-emerald-500/5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] block">
                [GATILHO +40% ATIVADO] Proteção de Lucro Intradiário
              </span>
              <span>O caixa do dia atingiu +40%. O tamanho do tiro foi travado em 5% da base inicial para proteger o lucro!</span>
            </div>
          </div>
          <span className="font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/50 shrink-0">
            Tiro: ${tiro.toFixed(2)}
          </span>
        </div>
      )}

      {/* Main Grid of 4 Core Capital Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. CAPITAL INICIAL */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition-all shadow-xl group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-slate-400" />
              Capital Inicial
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono text-slate-300 bg-white/10 border border-white/10 rounded-md backdrop-blur-md">
              Base $
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            ${capInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Banca base de referência</span>
            <span className="text-slate-300 font-medium">100.0%</span>
          </p>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-slate-400 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* 2. CAPITAL EM NEGOCIAÇÃO (MARGEM ALOCADA) */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-blue-500/40 rounded-2xl p-5 relative overflow-hidden transition-all shadow-xl group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-blue-400" />
              Capital em Negociação
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono text-blue-300 bg-blue-950/60 border border-blue-500/40 rounded-md backdrop-blur-md">
              Em Risco (10x)
            </span>
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono tracking-tight flex items-baseline gap-2">
            ${capNeg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Margem alocada em posições</span>
            <span className="text-blue-300 font-semibold">
              {percNegociacao.toFixed(1)}% do caixa
            </span>
          </p>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-blue-500"
              style={{ width: `${percNegociacao}%` }}
            ></div>
          </div>
        </div>

        {/* 3. CAPITAL LIVRE (CAIXA VIRTUAL) */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden transition-all shadow-xl group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Capital Livre
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-md backdrop-blur-md">
              Liquidez
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            ${capLivre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Disponível para novas ordens</span>
            <span className="text-emerald-300 font-semibold font-mono">
              Tiro: ${tiro.toFixed(2)} (5%)
            </span>
          </p>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500"
              style={{ width: `${percLivre}%` }}
            ></div>
          </div>
        </div>

        {/* 4. CAPITAL NO COFRE (LUCRO BLINDADO - NUNCA NEGOCIADO) */}
        <div className="bg-gradient-to-b from-slate-900/80 via-amber-950/30 to-slate-900/80 backdrop-blur-xl border border-amber-500/40 hover:border-amber-400 rounded-2xl p-5 relative overflow-hidden transition-all shadow-xl shadow-amber-500/10 group">
          {/* Subtle gold glow overlay */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              Capital no Cofre
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 rounded-md uppercase tracking-wider backdrop-blur-md">
              100% Seguro
            </span>
          </div>

          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight flex items-baseline justify-between">
            <span>${capCofre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <button
              onClick={onOpenSweepModal}
              className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-md shadow-amber-500/20"
              title="Transferir lucro intradiário para o Cofre"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Guardar
            </button>
          </div>

          <p className="text-[11px] text-amber-200/90 mt-2 flex items-center justify-between">
            <span>Lucro blindado para saque</span>
            <span className="font-semibold text-amber-300">Sexta 22h Auto</span>
          </p>

          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-sm shadow-amber-400"
              style={{ width: `${percCofre}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Patrimônio Total Summary Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Patrimônio Total Acumulado (Livre + Margem + Cofre)
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-3">
              ${patTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className={`text-sm font-bold font-sans ${pnl24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {pnl24h >= 0 ? '+' : ''}${pnl24h.toFixed(2)} (24h)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Win Rate 24h</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">{winRate24h}%</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Operações 24h</div>
            <div className="text-sm font-bold text-white font-mono">{totalTrades24h} trades</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Regra de Ouro</div>
            <div className="text-xs font-semibold text-amber-300">Lucro do Cofre Nunca é Riscado</div>
          </div>
        </div>
      </div>
    </div>
  );
};
