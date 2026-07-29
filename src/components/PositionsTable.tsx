import React from 'react';
import { ActivePosition } from '../types';
import { Layers, Shield, TrendingUp, TrendingDown, ArrowUpRight, Flame, Target, Percent } from 'lucide-react';

interface PositionsTableProps {
  positions: ActivePosition[];
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ positions }) => {
  if (positions.length === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center text-slate-400 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-3 text-slate-400 backdrop-blur-md">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-200">Nenhuma Posição Aberta no Momento</p>
        <p className="text-xs text-slate-400 mt-1">O robô V5.3 está escaneando as 30 moedas em busca de gatilhos de RSI, EMA50 e Momentum.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Posições Ativas em Negociação</h2>
          <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 backdrop-blur-md">
            {positions.length} / 10 ativas
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Alavancagem: <strong className="text-white">10x Futuros</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 backdrop-blur-md text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px] font-semibold">
              <th className="p-3.5 pl-5">Ativo / Categoria</th>
              <th className="p-3.5">Preço Médio</th>
              <th className="p-3.5">Preço Atual</th>
              <th className="p-3.5">Grid Reforço</th>
              <th className="p-3.5">Margem (5%)</th>
              <th className="p-3.5">RSI Entrada</th>
              <th className="p-3.5">Trailing Stop</th>
              <th className="p-3.5 pr-5 text-right">PnL Não Realizado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {positions.map((pos) => {
              const isProfit = pos.pnlNaoRealizado >= 0;

              return (
                <tr key={pos.moeda} className="hover:bg-white/5 transition-colors font-mono">
                  {/* Symbol & Category */}
                  <td className="p-3.5 pl-5 font-sans">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      {pos.moeda}
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        pos.categoria === 'MAJOR' 
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40' 
                          : 'bg-white/10 text-slate-300 border border-white/15'
                      }`}>
                        {pos.categoria}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {pos.contratos.toFixed(4)} contratos
                    </div>
                  </td>

                  {/* Preço Médio */}
                  <td className="p-3.5 font-bold text-slate-200">
                    ${pos.precoMedio < 10 ? pos.precoMedio.toFixed(4) : pos.precoMedio.toFixed(2)}
                  </td>

                  {/* Preço Atual */}
                  <td className="p-3.5 font-bold text-white">
                    ${pos.precoAtual < 10 ? pos.precoAtual.toFixed(4) : pos.precoAtual.toFixed(2)}
                  </td>

                  {/* Grid Status (1/3, 2/3) */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        pos.numOrdens > 1
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'bg-white/10 text-slate-300 border border-white/10'
                      }`}>
                        Ordem {pos.numOrdens}/{pos.maxOrdens}
                      </span>
                    </div>
                    {pos.proximoGatilhoGrid && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        Gatilho ATR: ${pos.proximoGatilhoGrid < 10 ? pos.proximoGatilhoGrid.toFixed(4) : pos.proximoGatilhoGrid.toFixed(2)}
                      </div>
                    )}
                  </td>

                  {/* Margem em risco */}
                  <td className="p-3.5 text-slate-300">
                    ${pos.capitalEmRisco.toFixed(2)}
                  </td>

                  {/* RSI Entrada */}
                  <td className="p-3.5">
                    <span className="text-emerald-400 font-semibold">{pos.rsiEntrada.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400 block">Var: +{(pos.varEntrada * 100).toFixed(2)}%</span>
                  </td>

                  {/* Trailing Stop Status */}
                  <td className="p-3.5">
                    {pos.trailingAtivo ? (
                      <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                        <Flame className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                        <span>ARMADO SURF</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-[11px]">
                        Aguardando +{pos.categoria === 'MAJOR' ? '0.7%' : '0.6%'}
                      </div>
                    )}
                  </td>

                  {/* PnL */}
                  <td className="p-3.5 pr-5 text-right font-sans">
                    <div className={`text-sm font-extrabold font-mono flex items-center justify-end gap-1 ${
                      isProfit ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {isProfit ? '+' : ''}${pos.pnlNaoRealizado.toFixed(2)}
                    </div>
                    <div className={`text-[11px] font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </div>
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
