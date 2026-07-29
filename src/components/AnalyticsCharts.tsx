import React from 'react';
import { TradeLog } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

interface AnalyticsChartsProps {
  trades: TradeLog[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ trades }) => {
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
    exitTypeMap[t.tipoSaida] = (exitTypeMap[t.tipoSaida] || 0) + t.lucroLiquido;
  });

  const exitTypeData = Object.keys(exitTypeMap).map(key => ({
    name: key === 'TAKE_PROFIT' ? 'Take Profit (Surf)' : key === 'RESGATE_GRID' ? 'Resgate Grid' : 'Stop Loss',
    value: parseFloat(exitTypeMap[key].toFixed(2)),
    color: key === 'TAKE_PROFIT' ? '#10b981' : key === 'RESGATE_GRID' ? '#f59e0b' : '#ef4444'
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          💡 <strong className="text-emerald-400">Take Profit (Surf)</strong> gera os maiores ganhos individuais (+0.7%), enquanto o <strong className="text-amber-400">Resgate do Grid</strong> blinda a carteira ao sair rápido com +0.4% em operações com reforço.
        </div>
      </div>
    </div>
  );
};
