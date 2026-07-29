import React, { useState } from 'react';
import { BotStatus, CapitalState } from '../types';
import { Cpu, Play, Pause, Sparkles, ShieldCheck, Lock, AlertTriangle, RefreshCcw, DollarSign, ArrowDownLeft, Zap } from 'lucide-react';

interface BotControlPanelProps {
  botStatus: BotStatus;
  capital: CapitalState;
  onToggleBot: () => void;
  onSimulateTick: (action: string) => void;
  onSweepVault: () => void;
}

export const BotControlPanel: React.FC<BotControlPanelProps> = ({
  botStatus,
  capital,
  onToggleBot,
  onSimulateTick,
  onSweepVault
}) => {
  const [sweepMessage, setSweepMessage] = useState<string | null>(null);

  const handleSweep = async () => {
    onSweepVault();
    setSweepMessage(`Sucesso! Os lucros foram transferidos para o Cofre Seguro.`);
    setTimeout(() => setSweepMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Bot Master Controls */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-md ${
              botStatus.isOnline
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}>
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Motor Institucional V5.3
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-md ${
                  botStatus.isOnline ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                }`}>
                  {botStatus.isOnline ? 'ONLINE (15s Loop)' : 'EM PAUSA'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{botStatus.clima}</p>
            </div>
          </div>

          <button
            onClick={onToggleBot}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xl backdrop-blur-md ${
              botStatus.isOnline
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {botStatus.isOnline ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar Motor</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Robô V5.3</span>
              </>
            )}
          </button>
        </div>

        {/* Core Mathematical Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="bg-black/40 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Tiro Dinâmico</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">${capital.tiroDinamico.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400 mt-1">5% do capital base ($50 mín)</div>
          </div>

          <div className="bg-black/40 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Alavancagem Futuros</div>
            <div className="text-lg font-bold text-blue-400 font-mono">10x Iso</div>
            <div className="text-[11px] text-slate-400 mt-1">Ganho real sem liquidação</div>
          </div>

          <div className="bg-black/40 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Gatilho +40% Dia</div>
            <div className="text-lg font-bold text-amber-300 font-mono">
              {capital.gatilho40Ativado ? 'ATIVADO' : 'INATIVO'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Trava tiro na base inicial do dia</div>
          </div>

          <div className="bg-black/40 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Saque do Cofre</div>
            <div className="text-lg font-bold text-purple-300 font-mono">Sexta 22h</div>
            <div className="text-[11px] text-slate-400 mt-1">Lucro blindado automático</div>
          </div>
        </div>
      </div>

      {/* Manual Vault Sweep Card */}
      <div className="bg-gradient-to-r from-slate-900/80 via-amber-950/40 to-slate-900/80 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-6 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-300 backdrop-blur-md">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                Varredura Manual para o Cofre (Transferência de Lucro)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Conforme a regra do robô, todo lucro acima de $1.000 pode ser transferido imediatamente para o Cofre Seguro para nunca mais ser colocado em risco.
              </p>
            </div>
          </div>

          <button
            onClick={handleSweep}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap backdrop-blur-md"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Transferir Excedente para Cofre</span>
          </button>
        </div>

        {sweepMessage && (
          <div className="mt-4 p-3 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{sweepMessage}</span>
          </div>
        )}
      </div>

      {/* Live Simulation Controls for Strategy Testing */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Testador de Reação da Fórmula V5.3 (Simulação de Eventos)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Simule eventos de mercado para testar o comportamento do robô e ver a atualização instantânea do Cofre e do Dashboard:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onSimulateTick('take_profit')}
            className="p-3 bg-black/40 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-xl text-left transition-all group backdrop-blur-md"
          >
            <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              Simular Take Profit (Surf)
            </div>
            <div className="text-[11px] text-slate-400">
              Gera lucro entre +$4 e +$12 e atualiza o caixa livre.
            </div>
          </button>

          <button
            onClick={() => onSimulateTick('stop_loss')}
            className="p-3 bg-black/40 hover:bg-white/10 border border-white/10 hover:border-red-500/50 rounded-xl text-left transition-all group backdrop-blur-md"
          >
            <div className="text-xs font-bold text-red-400 group-hover:text-red-300 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Simular Stop Loss (-4%)
            </div>
            <div className="text-[11px] text-slate-400">
              Executa o stop de proteção e ativa quarentena de 45 min no ativo.
            </div>
          </button>

          <button
            onClick={() => onSimulateTick('btc_crash')}
            className="p-3 bg-black/40 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 rounded-xl text-left transition-all group backdrop-blur-md"
          >
            <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Simular Flash Crash BTC (-3.4%)
            </div>
            <div className="text-[11px] text-slate-400">
              Dispara o bloqueio de correlação e suspende o mercado por 30 min.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
