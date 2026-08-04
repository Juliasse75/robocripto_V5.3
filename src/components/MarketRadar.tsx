import React, { useState } from 'react';
import { MarketSignal } from '../types';
import { Zap, TrendingUp, TrendingDown, CheckCircle, AlertOctagon, Flame, Eye, Lock } from 'lucide-react';

interface MarketRadarProps {
  signals: MarketSignal[];
}

export const MarketRadar: React.FC<MarketRadarProps> = ({ signals }) => {
  const [filter, setFilter] = useState<'ALL' | 'ELEGIVEL' | 'POSICAO_ABERTA'>('ALL');

  const safeSignals = Array.isArray(signals) ? signals : [];
  const filteredSignals = safeSignals.filter(s => {
    if (filter === 'ELEGIVEL') return s.status === 'ELEGIVEL';
    if (filter === 'POSICAO_ABERTA') return s.status === 'POSICAO_ABERTA';
    return true;
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Radar de Oportunidades (30 Ativos Selecionados)
          </h2>
          <p className="text-xs text-slate-400">
            Escaneamento do Robô V5.3: RSI(7) entre 45-70 + Preço &gt; EMA50 + Var3 &gt; 0.2% + Filtro BTC
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter === 'ALL' ? 'bg-white/10 text-white border border-white/15' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({safeSignals.length})
          </button>
          <button
            onClick={() => setFilter('ELEGIVEL')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter === 'ELEGIVEL' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Elegíveis ({signals.filter(s => s.status === 'ELEGIVEL').length})
          </button>
          <button
            onClick={() => setFilter('POSICAO_ABERTA')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter === 'POSICAO_ABERTA' ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Abertas ({signals.filter(s => s.status === 'POSICAO_ABERTA').length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 backdrop-blur-md text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px] font-semibold">
              <th className="p-3.5 pl-5">Ativo / Categoria</th>
              <th className="p-3.5">Preço Atual</th>
              <th className="p-3.5">EMA 50</th>
              <th className="p-3.5">RSI 7 (45 - 70)</th>
              <th className="p-3.5">Var 3 Velas (5m)</th>
              <th className="p-3.5">Vol. Ratio</th>
              <th className="p-3.5 pr-5 text-right">Status do Robô</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSignals.map((sig) => {
              const isRsiValid = sig.rsi >= 45 && sig.rsi <= 70;
              const isAboveEma = sig.precoAtual > sig.ema50;
              const isMomentumPositive = sig.var3 > 0.002;

              return (
                <tr key={sig.moeda} className="hover:bg-white/5 transition-colors font-mono">
                  <td className="p-3.5 pl-5 font-sans">
                    <span className="font-bold text-white text-sm block">{sig.moeda}</span>
                    <span className="text-[10px] text-slate-400">{sig.categoria}</span>
                  </td>

                  <td className="p-3.5 font-bold text-slate-200">
                    ${sig.precoAtual < 10 ? sig.precoAtual.toFixed(4) : sig.precoAtual.toFixed(2)}
                  </td>

                  <td className="p-3.5 text-slate-400">
                    ${sig.ema50 < 10 ? sig.ema50.toFixed(4) : sig.ema50.toFixed(2)}
                  </td>

                  <td className="p-3.5">
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      isRsiValid ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-white/10 text-slate-400'
                    }`}>
                      {sig.rsi.toFixed(1)}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className={`font-bold ${
                      sig.var3 >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {sig.var3 >= 0 ? '+' : ''}{(sig.var3 * 100).toFixed(2)}%
                    </span>
                  </td>

                  <td className="p-3.5 text-slate-300">
                    {sig.volumeRatio.toFixed(1)}x
                  </td>

                  <td className="p-3.5 pr-5 text-right font-sans">
                    {sig.status === 'ELEGIVEL' && (
                      <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md">
                        <CheckCircle className="w-3.5 h-3.5" /> GATILHO PRONTO
                      </span>
                    )}
                    {sig.status === 'POSICAO_ABERTA' && (
                      <span className="inline-flex items-center gap-1 text-blue-300 bg-blue-950/80 border border-blue-500/40 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> POSIÇÃO ABERTA
                      </span>
                    )}
                    {sig.status === 'QUEDA_LIVRE' && (
                      <span className="inline-flex items-center gap-1 text-red-300 bg-red-950/80 border border-red-500/40 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md">
                        <AlertOctagon className="w-3.5 h-3.5" /> FLASH CRASH
                      </span>
                    )}
                    {sig.status === 'COOLDOWN' && (
                      <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md">
                        <Lock className="w-3.5 h-3.5" /> QUARENTENA 45M
                      </span>
                    )}
                    {sig.status === 'RSI_FORA_FAIXA' && (
                      <span className="text-slate-400 text-[11px]">RSI Fora da Faixa</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
