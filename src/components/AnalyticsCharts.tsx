import React, { useState, useEffect } from 'react';
import { TradeLog } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from 'recharts';
import { CPCVReportJSON } from '../utils/cpcvEvaluator';
import { RefreshCw, ShieldCheck, Layers, Activity, Sparkles, AlertCircle } from 'lucide-react';

interface AnalyticsChartsProps {
  trades: TradeLog[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ trades }) => {
  const [cpcvReport, setCpcvReport] = useState<CPCVReportJSON | null>(null);
  const [isLoadingCpcv, setIsLoadingCpcv] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'equity' | 'cpcv'>('equity');

  // Fetch CPCV evaluation metrics from backend API
  const fetchCpcvReport = async () => {
    setIsLoadingCpcv(true);
    try {
      const res = await fetch('/api/cpcv-eval?nBlocks=6&kTestBlocks=2&purgeHours=4&embargoPct=0.02');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.report) {
          setCpcvReport(data.report);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados do CPCV:', e);
    } finally {
      setIsLoadingCpcv(false);
    }
  };

  useEffect(() => {
    fetchCpcvReport();
  }, []);

  // Cumulative equity curve data calculation
  let runningEquity = 1000;
  const equityData = trades.slice().reverse().map((t, idx) => {
    if (t.tipoSaida !== 'SAQUE_SEXTA') {
      runningEquity += t.lucroLiquido;
    }
    return {
      index: idx + 1,
      trade: t.moeda,
      equity: parseFloat(runningEquity.toFixed(2)),
      pnl: t.lucroLiquido
    };
  });

  // Distribution by Exit Type
  const exitTypeMap: Record<string, number> = {};
  trades.forEach(t => {
    if (t.tipoSaida === 'SAQUE_SEXTA') return;
    const typeKey = t.tipoSaida.includes('TAKE_PROFIT') ? 'TAKE_PROFIT'
                  : t.tipoSaida.includes('STOP_LOSS') ? 'STOP_LOSS'
                  : t.tipoSaida;
    exitTypeMap[typeKey] = (exitTypeMap[typeKey] || 0) + t.lucroLiquido;
  });

  const exitTypeData = Object.keys(exitTypeMap).map(key => ({
    name: key === 'TAKE_PROFIT' ? 'Take Profit' : key === 'RESGATE_GRID' ? 'Resgate Grid' : 'Stop Loss',
    value: parseFloat(exitTypeMap[key].toFixed(2)),
    color: key === 'TAKE_PROFIT' ? '#10b981' : key === 'RESGATE_GRID' ? '#f59e0b' : '#ef4444'
  }));

  return (
    <div className="space-y-6">
      {/* Tab Switcher: Curva de Capital vs Validação CPCV Quant */}
      <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('equity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'equity'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            Curva de Patrimônio ($)
          </button>
          <button
            onClick={() => setActiveSubTab('cpcv')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'cpcv'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Validação CPCV (C(6,2) + Expurgo + Embargo)
            {cpcvReport && (
              <span className="bg-slate-950/80 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-mono border border-emerald-500/30">
                Sharpe: {cpcvReport.averageSharpe}
              </span>
            )}
          </button>
        </div>

        {activeSubTab === 'cpcv' && (
          <button
            onClick={fetchCpcvReport}
            disabled={isLoadingCpcv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCpcv ? 'animate-spin' : ''}`} />
            Recalcular CPCV
          </button>
        )}
      </div>

      {/* VIEW 1: CURVA DE PATRIMÔNIO & SAÍDAS */}
      {activeSubTab === 'equity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
          {/* Equity Curve Chart */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">Evolução do Capital Virtual ($)</h3>
            <p className="text-xs text-slate-400 mb-4">Curva de patrimônio intradiário do motor V5.3</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="index" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', color: '#fff', fontSize: '12px', backdropFilter: 'blur(12px)' }}
                    formatter={(value: any) => [`$${value}`, 'Patrimônio']}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PnL by Exit Type */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Distribuição de Lucros por Gatilho</h3>
              <p className="text-xs text-slate-400 mb-4">Contribuição do Trailing Stop vs Resgate do Grid</p>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exitTypeData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', color: '#fff', fontSize: '12px', backdropFilter: 'blur(12px)' }}
                      formatter={(val: any) => [`$${val}`, 'Resultado']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {exitTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 text-[11px] text-slate-400">
              💡 <strong className="text-emerald-400">Take Profit (Surf)</strong> gera os maiores ganhos individuais, enquanto o <strong className="text-amber-400">Resgate do Grid</strong> blinda a carteira ao sair rápido com lucros parciais.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PAINEL DE VALIDAÇÃO CRUZADA CPCV QUANT */}
      {activeSubTab === 'cpcv' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Sharpe Médio */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Sharpe Ratio Médio (Robustez)</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {isLoadingCpcv ? '...' : cpcvReport?.averageSharpe ?? '0.00'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {cpcvReport && cpcvReport.averageSharpe >= 1.5
                  ? '✅ Alta robustez sem overfitting'
                  : '⚠️ Atenção aos ajustes de ruído'}
              </p>
            </div>

            {/* KPI 2: Desvio Padrão do Sharpe */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Variância do Sharpe (σ)</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono">
                {isLoadingCpcv ? '...' : `±${cpcvReport?.sharpeStdDev ?? '0.00'}`}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Estabilidade entre os {cpcvReport?.totalPaths ?? 15} caminhos
              </p>
            </div>

            {/* KPI 3: % Caminhos Positivos */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Taxa de Sucesso dos Caminhos</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300 font-mono">
                {isLoadingCpcv ? '...' : `${cpcvReport?.positivePathsPercent ?? 0}%`}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {cpcvReport?.positivePathsPercent === 100
                  ? '100% dos caminhos fecharam positivos'
                  : 'Caminhos de teste com lucro positivo'}
              </p>
            </div>

            {/* KPI 4: Combinatória & Purging */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Configuração CPCV</span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-purple-300 font-mono">
                C(6,2) = 15 Caminhos
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Expurgo: 4h | Embargo: 2%
              </p>
            </div>
          </div>

          {/* Gráfico de Distribuição do Índice de Sharpe por Caminho */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Índice de Sharpe Anualizado por Caminho Combinatorial
                </h3>
                <p className="text-xs text-slate-400">
                  Validação em 15 caminhos independentes sem contaminação temporal (Purged & Embargoed)
                </p>
              </div>
              <div className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-xl self-start sm:self-auto">
                Sharpe Médio = {cpcvReport?.averageSharpe ?? '0.00'}
              </div>
            </div>

            <div className="h-72 w-full">
              {cpcvReport && cpcvReport.chartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cpcvReport.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis
                      dataKey="pathLabel"
                      stroke="#94a3b8"
                      fontSize={9}
                      tickLine={false}
                      angle={-35}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px',
                        backdropFilter: 'blur(12px)',
                      }}
                      formatter={(val: any, name: string) => [
                        name === 'sharpe' ? `${val} (Anualizado)` : `${val}%`,
                        name === 'sharpe' ? 'Sharpe Ratio' : 'Retorno'
                      ]}
                    />
                    <ReferenceLine y={1.5} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Meta (1.5)', fill: '#10b981', fontSize: 10 }} />
                    <Bar dataKey="sharpe" radius={[4, 4, 0, 0]}>
                      {cpcvReport.chartData.map((entry, index) => (
                        <Cell
                          key={`cpcv-bar-${index}`}
                          fill={
                            entry.sharpe >= 2.0
                              ? '#10b981'
                              : entry.sharpe >= 1.0
                              ? '#06b6d4'
                              : entry.sharpe >= 0
                              ? '#f59e0b'
                              : '#ef4444'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Carregando gráfico de validação CPCV...
                </div>
              )}
            </div>
          </div>

          {/* Tabela Detalhada dos 15 Caminhos */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              Detalhamento de Performance dos 15 Caminhos de Teste
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold text-[11px]">
                    <th className="p-3">Caminho ID</th>
                    <th className="p-3">Blocos de Teste (k=2)</th>
                    <th className="p-3">Velas Treino</th>
                    <th className="p-3">Velas Teste</th>
                    <th className="p-3">Trades</th>
                    <th className="p-3">Win Rate</th>
                    <th className="p-3">Retorno Acum.</th>
                    <th className="p-3">Volatilidade (σ)</th>
                    <th className="p-3 text-right">Sharpe Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {cpcvReport?.paths.map((p) => (
                    <tr key={p.splitId} className="hover:bg-white/5 transition-colors font-mono text-[11px]">
                      <td className="p-3 font-bold text-white">#Path-{p.splitId}</td>
                      <td className="p-3 text-cyan-300">[{p.testBlockIndices.join(', ')}]</td>
                      <td className="p-3 text-slate-400">{p.trainCandleCount}</td>
                      <td className="p-3 text-slate-400">{p.testCandleCount}</td>
                      <td className="p-3 text-white">{p.totalTrades}</td>
                      <td className="p-3 text-emerald-400">{p.winRate}%</td>
                      <td className="p-3 font-bold text-emerald-400">+{p.accumulatedReturn}%</td>
                      <td className="p-3 text-slate-300">{p.volatility}%</td>
                      <td className="p-3 text-right font-bold text-emerald-300">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          p.sharpeRatio >= 1.5
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                        }`}>
                          {p.sharpeRatio}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
