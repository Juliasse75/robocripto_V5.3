import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CapitalCards } from './components/CapitalCards';
import { PositionsTable } from './components/PositionsTable';
import { AuditPanel24h } from './components/AuditPanel24h';
import { MarketRadar } from './components/MarketRadar';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { BotControlPanel } from './components/BotControlPanel';
import { SupabaseRailwayGuide } from './components/SupabaseRailwayGuide';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { BinanceTestnetPanel } from './components/BinanceTestnetPanel';
import {
  CapitalState,
  TradeLog,
  ActivePosition,
  MarketSignal,
  BotStatus,
  AuditSummary24h,
  UserSession
} from './types';
import { INITIAL_CAPITAL, INITIAL_BOT_STATUS, INITIAL_ACTIVE_POSITIONS, INITIAL_TRADE_LOGS, INITIAL_MARKET_SIGNALS } from './data/mockData';
import { ShieldCheck, Lock, Activity, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h');

  // User session state (persisted in localStorage)
  const [userSession, setUserSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('robocripto_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isAuthenticated === 'boolean') {
          return parsed;
        }
      } catch (e) { }
    }
    return { isAuthenticated: false, username: '' };
  });

  // Core Data States
  const [capital, setCapital] = useState<CapitalState>(INITIAL_CAPITAL);
  const [botStatus, setBotStatus] = useState<BotStatus>(INITIAL_BOT_STATUS);
  const [positions, setPositions] = useState<ActivePosition[]>(INITIAL_ACTIVE_POSITIONS);
  const [trades, setTrades] = useState<TradeLog[]>(INITIAL_TRADE_LOGS);
  const [signals, setSignals] = useState<MarketSignal[]>(INITIAL_MARKET_SIGNALS);
  const [audit24h, setAudit24h] = useState<AuditSummary24h>({
    lucroLiquido24h: 114.20,
    totalOperacoes: 18,
    vitorias: 15,
    derrotas: 3,
    winRate: 83.3,
    lucroMedioVitoria: 9.80,
    perdaMediaDerrota: 10.90,
    fatorLucro: 4.5,
    taxasEstimadas: 2.70,
    maiorLucro: 18.50,
    maiorPrejuizo: -20.48,
    duracaoMediaMinutos: 22,
    lucroPorTipoSaida: {
      TAKE_PROFIT: { count: 12, totalPnL: 88.50 },
      RESGATE_GRID: { count: 3, totalPnL: 18.20 },
      STOP_LOSS: { count: 3, totalPnL: -40.73 },
      SAQUE_SEXTA: { count: 1, totalPnL: 285.40 },
      FECHAMENTO_MANUAL: { count: 0, totalPnL: 0 }
    }
  });

  // Save session when modified
  useEffect(() => {
    localStorage.setItem('robocripto_user_session', JSON.stringify(userSession));
  }, [userSession]);

  // Sync capital ceiling with Binance Testnet allocation
  useEffect(() => {
    const applyAllocation = (allocatedCap: number) => {
      if (!isNaN(allocatedCap) && allocatedCap > 0) {
        setCapital(prev => {
          const neg = !isNaN(Number(prev.capitalEmNegociacao)) ? Number(prev.capitalEmNegociacao) : 0;
          const cofre = !isNaN(Number(prev.capitalCofre)) ? Number(prev.capitalCofre) : 0;
          return {
            ...prev,
            capitalInicial: allocatedCap,
            capitalLivre: allocatedCap,
            patrimonioTotal: parseFloat((allocatedCap + neg + cofre).toFixed(2))
          };
        });
      }
    };

    const savedAlloc = localStorage.getItem('ROBOCRIPTO_CAPITAL_TESTNET_ALLOC');
    if (savedAlloc) applyAllocation(Number(savedAlloc));

    const handleSync = (e: any) => {
      const val = e.detail?.allocatedCap;
      if (val) applyAllocation(Number(val));
    };

    window.addEventListener('ROBOCRIPTO_CAPITAL_SYNC', handleSync);
    return () => window.removeEventListener('ROBOCRIPTO_CAPITAL_SYNC', handleSync);
  }, []);

  // Fetch live stats from API
  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/stats');
      let statsCapital: any = null;
      if (res.ok) {
        const data = await res.json();
        if (data.capital) {
          statsCapital = data.capital;
          const capInicial = Number(data.capital.capitalInicial) || 1000;
          const capLivre = !isNaN(Number(data.capital.capitalLivre)) ? Number(data.capital.capitalLivre) : capInicial;
          const capCofre = !isNaN(Number(data.capital.capitalCofre)) ? Number(data.capital.capitalCofre) : 0;
          const capNeg = !isNaN(Number(data.capital.capitalEmNegociacao)) ? Number(data.capital.capitalEmNegociacao) : 0;
          const patTotal = !isNaN(Number(data.capital.patrimonioTotal)) ? Number(data.capital.patrimonioTotal) : (capLivre + capNeg + capCofre);
          setCapital({
            ...data.capital,
            capitalInicial: capInicial,
            capitalLivre: capLivre,
            capitalCofre: capCofre,
            capitalEmNegociacao: capNeg,
            patrimonioTotal: parseFloat(patTotal.toFixed(2))
          });
        }
        if (data.botStatus) setBotStatus(data.botStatus);
        if (data.audit24h) setAudit24h(data.audit24h);
      }

      const resPositions = await fetch('/api/positions');
      if (resPositions.ok) {
        const posData = await resPositions.json();
        const arr = Array.isArray(posData) ? posData : [];
        setPositions(arr);

        // Auto-correção para garantir que o Capital em Negociação nunca seja zero quando existirem posições abertas
        const sumRisco = arr.reduce((acc: number, p: any) => acc + (Number(p.capitalEmRisco) || 50), 0);
        if (arr.length > 0 && sumRisco > 0) {
          setCapital(prev => {
            const livre = !isNaN(Number(prev.capitalLivre)) ? Number(prev.capitalLivre) : 1000;
            const cofre = !isNaN(Number(prev.capitalCofre)) ? Number(prev.capitalCofre) : 0;
            return {
              ...prev,
              capitalEmNegociacao: parseFloat(sumRisco.toFixed(2)),
              patrimonioTotal: parseFloat((livre + sumRisco + cofre).toFixed(2))
            };
          });
        }
      }

      const resTrades = await fetch(`/api/trades?timeframe=${selectedTimeframe}`);
      if (resTrades.ok) {
        const trdData = await resTrades.json();
        setTrades(trdData);
      }

      const resSignals = await fetch('/api/market-signals');
      if (resSignals.ok) {
        const sigData = await resSignals.json();
        setSignals(sigData);
      }
    } catch (e) {
      console.log('Utilizando estado local do robô.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleRefresh = () => {
      fetchDashboardData();
    };
    window.addEventListener('ROBOCRIPTO_REFRESH_DASHBOARD', handleRefresh);
    // Poll stats every 15s to simulate live trading tick loop
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('ROBOCRIPTO_REFRESH_DASHBOARD', handleRefresh);
    };
  }, [selectedTimeframe]);

  const handleClearPositions = async () => {
    try {
      await fetch('/api/bot/clear-positions', { method: 'POST' });
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('robocripto_user_session');
    setUserSession({ isAuthenticated: false, username: '' });
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
  };

  const handleToggleBot = async () => {
    try {
      const res = await fetch('/api/bot/toggle', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBotStatus(prev => ({
          ...prev,
          isOnline: data.isOnline,
          statusTexto: data.statusTexto
        }));
      }
    } catch (e) {
      setBotStatus(prev => ({
        ...prev,
        isOnline: !prev.isOnline,
        statusTexto: !prev.isOnline ? "MOTOR V5.3 OPERANDO" : "MOTOR EM PAUSA"
      }));
    }
  };

  const handleSimulateTick = async (action: string) => {
    try {
      const res = await fetch('/api/bot/simulate-tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        if (data.capitalState) setCapital(data.capitalState);
        if (data.botStatus) setBotStatus(data.botStatus);
        if (data.tradeLogs) setTrades(data.tradeLogs);
        fetchDashboardData();
      }
    } catch (e) {
      // Local fallback simulation
      if (action === 'take_profit') {
        const profit = 7.50;
        setCapital(prev => {
          const livre = !isNaN(Number(prev.capitalLivre)) ? Number(prev.capitalLivre) : 1000;
          const total = !isNaN(Number(prev.patrimonioTotal)) ? Number(prev.patrimonioTotal) : livre;
          return {
            ...prev,
            capitalLivre: parseFloat((livre + profit).toFixed(2)),
            patrimonioTotal: parseFloat((total + profit).toFixed(2))
          };
        });
      }
    }
  };

  const handleSweepVault = async () => {
    try {
      const res = await fetch('/api/bot/sweep-vault', { method: 'POST' });
      const data = await res.json();
      if (data.capitalState) setCapital(data.capitalState);
      fetchDashboardData();
    } catch (e) {
      const lucroLivre = capital.capitalLivre - capital.capitalInicial;
      if (lucroLivre > 0) {
        setCapital(prev => ({
          ...prev,
          capitalCofre: parseFloat((prev.capitalCofre + lucroLivre).toFixed(2)),
          capitalLivre: prev.capitalInicial
        }));
      }
    }
  };

  if (!userSession.isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Frosted Glass Ambient Mesh Background Blobs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Navigation Header */}
      <div className="relative z-10">
        <Header
          botStatus={botStatus}
          capital={capital}
          userSession={userSession}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onRefresh={fetchDashboardData}
          isRefreshing={isRefreshing}
          onOpenLogin={() => setIsLoginOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        
        {/* TAB 1: VISÃO GERAL & COFRE */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 4 Core Capital Cards (Inicial, Em Negociação, Livre, Cofre) */}
            <CapitalCards capital={capital} onOpenSweepModal={handleSweepVault} />

            {/* Active Trading Positions */}
            <PositionsTable positions={positions} onClearPositions={handleClearPositions} />

            {/* Performance & Equity Charts */}
            <AnalyticsCharts trades={trades} />
          </div>
        )}

        {/* TAB: BINANCE TESTNET (ETAPA 1) */}
        {activeTab === 'binance' && (
          <div className="animate-fadeIn">
            <BinanceTestnetPanel />
          </div>
        )}

        {/* TAB 2: AUDITORIA 24H & LOGS */}
        {activeTab === 'audit' && (
          <div className="animate-fadeIn">
            <AuditPanel24h
              audit24h={audit24h}
              trades={trades}
              onTimeframeChange={(tf) => setSelectedTimeframe(tf)}
              selectedTimeframe={selectedTimeframe}
            />
          </div>
        )}

        {/* TAB 3: RADAR 30 MOEDAS */}
        {activeTab === 'radar' && (
          <div className="animate-fadeIn">
            <MarketRadar signals={signals} />
          </div>
        )}

        {/* TAB 4: SIMULAÇÃO & PARÂMETROS */}
        {activeTab === 'controls' && (
          <div className="animate-fadeIn">
            <BotControlPanel
              botStatus={botStatus}
              capital={capital}
              onToggleBot={handleToggleBot}
              onSimulateTick={handleSimulateTick}
              onSweepVault={handleSweepVault}
            />
          </div>
        )}

        {/* TAB 5: RAILWAY & SUPABASE HUB */}
        {activeTab === 'integrations' && (
          <div className="animate-fadeIn">
            <SupabaseRailwayGuide />
          </div>
        )}

      </main>

      {/* Footer info */}
      <footer className="border-t border-white/10 bg-slate-950/60 backdrop-blur-xl py-6 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Logusq Institutional • RobôCripto V5.3 Fogo Livre Blindado</p>
          <p className="flex items-center gap-2 text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4" />
            Caixa Base: $1.000,00 | Regra do Cofre Ativa
          </p>
        </div>
      </footer>

      {/* Login Modal Overlay */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
