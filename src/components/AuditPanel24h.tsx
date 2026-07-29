import React, { useState } from 'react';
import { TradeLog, AuditSummary24h, ExitType } from '../types';
import { Shield, Download, Search, Filter, CheckCircle2, XCircle, RefreshCw, Calendar, TrendingUp, DollarSign, Clock, Award } from 'lucide-react';

interface AuditPanel24hProps {
  audit24h: AuditSummary24h;
  trades: TradeLog[];
  onTimeframeChange: (tf: string) => void;
  selectedTimeframe: string;
}

export const AuditPanel24h: React.FC<AuditPanel24hProps> = ({
  audit24h,
  trades,
  onTimeframeChange,
  selectedTimeframe
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExitType, setFilterExitType] = useState<string>('ALL');

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.moeda.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExit = filterExitType === 'ALL' || trade.tipoSaida === filterExitType;
    return matchesSearch && matchesExit;
  });

  const handleExportCSV = () => {
    const headers = ['Data_Hora', 'Moeda', 'Tipo_Saida', 'Contratos', 'Preco_Medio', 'Preco_Saida', 'Num_Ordens', 'RSI_Entrada', 'Var_Entrada', 'Lucro_Liquido', 'Novo_Caixa'];
    const rows = filteredTrades.map(t => [
      t.dataHora,
      t.moeda,
      t.tipoSaida,
      t.contratos,
      t.precoMedio,
      t.precoSaida,
      t.numOrdens,
      t.rsiEntrada || 'N/A',
      t.varEntrada || 'N/A',
      t.lucroLiquido,
      t.novoCaixa
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_v53_${selectedTimeframe}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Audit Header & Filters */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Painel de Auditoria de Operações & Lucro
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Relatório de auditoria de negociações do robô V5.3. Puxe os dados das últimas 24h para análises de performance.
          </p>
        </div>

        {/* Timeframe selector buttons & Export button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-black/40 p-1 border border-white/10 rounded-xl flex items-center gap-1 backdrop-blur-md">
            <button
              onClick={() => onTimeframeChange('24h')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedTimeframe === '24h'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24 Horas
            </button>
            <button
              onClick={() => onTimeframeChange('7d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedTimeframe === '7d'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => onTimeframeChange('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedTimeframe === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todo o Histórico
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 backdrop-blur-md"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Audit Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Resultado Liquido */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Resultado Líquido</div>
          <div className={`text-xl font-extrabold font-mono mt-1 ${
            audit24h.lucroLiquido24h >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {audit24h.lucroLiquido24h >= 0 ? '+' : ''}${audit24h.lucroLiquido24h.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Livre de corretagem</div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Taxa de Acerto</div>
          <div className="text-xl font-extrabold text-white font-mono mt-1">
            {audit24h.winRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {audit24h.vitorias}V / {audit24h.derrotas}D ({audit24h.totalOperacoes} total)
          </div>
        </div>

        {/* Fator de Lucro */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Fator de Lucro</div>
          <div className="text-xl font-extrabold text-amber-300 font-mono mt-1">
            {audit24h.fatorLucro}x
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Razão Ganho/Perda</div>
        </div>

        {/* Lucro Medio x Perda Media */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Médias (V / D)</div>
          <div className="text-xs font-bold font-mono mt-1 text-emerald-400">
            +${audit24h.lucroMedioVitoria}
          </div>
          <div className="text-xs font-bold font-mono text-red-400">
            -${audit24h.perdaMediaDerrota}
          </div>
        </div>

        {/* Taxas de Corretagem */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Taxas Taker (0.05%)</div>
          <div className="text-xl font-extrabold text-slate-200 font-mono mt-1">
            ${audit24h.taxasEstimadas.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pago à Binance/Bybit</div>
        </div>

        {/* Duração Média */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Duração Média</div>
          <div className="text-xl font-extrabold text-teal-300 font-mono mt-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {audit24h.duracaoMediaMinutos} min
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ciclos M5 de Scalping</div>
        </div>
      </div>

      {/* Trade Log Filters & Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por moeda (Ex: SOL)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 backdrop-blur-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Tipo de Saída:
            </span>
            <select
              value={filterExitType}
              onChange={(e) => setFilterExitType(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/80 backdrop-blur-md"
            >
              <option value="ALL">Todas ({trades.length})</option>
              <option value="TAKE_PROFIT">Take Profit (Surf)</option>
              <option value="RESGATE_GRID">Resgate de Grid</option>
              <option value="STOP_LOSS">Stop Loss</option>
              <option value="SAQUE_SEXTA">Saque para o Cofre</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 backdrop-blur-md text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px] font-semibold">
                <th className="p-3.5 pl-5">Data / Hora</th>
                <th className="p-3.5">Ativo</th>
                <th className="p-3.5">Tipo de Fechamento</th>
                <th className="p-3.5">Ordens Grid</th>
                <th className="p-3.5">Preço Médio</th>
                <th className="p-3.5">Preço Saída</th>
                <th className="p-3.5">RSI Entrada</th>
                <th className="p-3.5 pr-5 text-right">Lucro Líquido ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.map((t) => {
                const isPositive = t.lucroLiquido >= 0;

                return (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors font-mono">
                    <td className="p-3.5 pl-5 text-slate-400 text-[11px]">{t.dataHora}</td>
                    <td className="p-3.5 font-bold text-white">{t.moeda}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.tipoSaida === 'TAKE_PROFIT'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : t.tipoSaida === 'RESGATE_GRID'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : t.tipoSaida === 'SAQUE_SEXTA'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                          : 'bg-red-950/80 text-red-300 border border-red-500/40'
                      }`}>
                        {t.tipoSaida === 'TAKE_PROFIT' && '🏄 TAKE PROFIT'}
                        {t.tipoSaida === 'RESGATE_GRID' && '🤝 RESGATE GRID'}
                        {t.tipoSaida === 'STOP_LOSS' && '🚨 STOP LOSS'}
                        {t.tipoSaida === 'SAQUE_SEXTA' && '🔒 SAQUE COFRE'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{t.numOrdens > 0 ? `${t.numOrdens} orden(s)` : '-'}</td>
                    <td className="p-3.5 text-slate-300">${t.precoMedio < 10 ? t.precoMedio.toFixed(4) : t.precoMedio.toFixed(2)}</td>
                    <td className="p-3.5 text-slate-300">${t.precoSaida < 10 ? t.precoSaida.toFixed(4) : t.precoSaida.toFixed(2)}</td>
                    <td className="p-3.5 text-emerald-400">{t.rsiEntrada ? t.rsiEntrada.toFixed(1) : '-'}</td>
                    <td className={`p-3.5 pr-5 text-right font-extrabold text-sm font-mono ${
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}${t.lucroLiquido.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
