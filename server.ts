import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_CAPITAL, INITIAL_BOT_STATUS, INITIAL_ACTIVE_POSITIONS, INITIAL_TRADE_LOGS, INITIAL_MARKET_SIGNALS } from "./src/data/mockData";
import { CapitalState, TradeLog, ActivePosition, BotStatus, AuditSummary24h } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check endpoint
  app.get(["/health", "/api/health"], (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Mutable In-Memory State
  let capitalState: CapitalState = { ...INITIAL_CAPITAL };
  let botStatus: BotStatus = { ...INITIAL_BOT_STATUS };
  let activePositions: ActivePosition[] = [...INITIAL_ACTIVE_POSITIONS];
  let tradeLogs: TradeLog[] = [...INITIAL_TRADE_LOGS];
  let marketSignals = [...INITIAL_MARKET_SIGNALS];

  // Auth credentials (in real production, password can be configured via ENV)
  const AUTH_USER = process.env.ADMIN_USER || "admin";
  const AUTH_PASS = process.env.ADMIN_PASS || "logusq2026";

  // Helper to recalculate 24h audit metrics
  function calculate24hAudit(): AuditSummary24h {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const trades24h = tradeLogs.filter(t => {
      const ts = new Date(t.dataHora).getTime();
      return !isNaN(ts) ? ts >= cutoff : true;
    });

    let lucroLiquido24h = 0;
    let vitorias = 0;
    let derrotas = 0;
    let totalWinVal = 0;
    let totalLossVal = 0;
    let maiorLucro = 0;
    let maiorPrejuizo = 0;
    let totalDuracao = 0;

    const lucroPorTipoSaida: Record<string, { count: number; totalPnL: number }> = {
      TAKE_PROFIT: { count: 0, totalPnL: 0 },
      STOP_LOSS: { count: 0, totalPnL: 0 },
      RESGATE_GRID: { count: 0, totalPnL: 0 },
      SAQUE_SEXTA: { count: 0, totalPnL: 0 },
      FECHAMENTO_MANUAL: { count: 0, totalPnL: 0 },
    };

    trades24h.forEach(t => {
      if (t.tipoSaida === 'SAQUE_SEXTA') return; // Skip vault sweep from win/loss trade counts
      const pnl = t.lucroLiquido;
      lucroLiquido24h += pnl;

      if (!lucroPorTipoSaida[t.tipoSaida]) {
        lucroPorTipoSaida[t.tipoSaida] = { count: 0, totalPnL: 0 };
      }
      lucroPorTipoSaida[t.tipoSaida].count += 1;
      lucroPorTipoSaida[t.tipoSaida].totalPnL += pnl;

      totalDuracao += t.duracaoMinutos || 20;

      if (pnl > 0) {
        vitorias++;
        totalWinVal += pnl;
        if (pnl > maiorLucro) maiorLucro = pnl;
      } else if (pnl < 0) {
        derrotas++;
        totalLossVal += Math.abs(pnl);
        if (pnl < maiorPrejuizo) maiorPrejuizo = pnl;
      }
    });

    const totalOperacoes = vitorias + derrotas;
    const winRate = totalOperacoes > 0 ? (vitorias / totalOperacoes) * 100 : 0;
    const lucroMedioVitoria = vitorias > 0 ? totalWinVal / vitorias : 0;
    const perdaMediaDerrota = derrotas > 0 ? totalLossVal / derrotas : 0;
    const fatorLucro = totalLossVal > 0 ? totalWinVal / totalLossVal : (totalWinVal > 0 ? 99 : 0);
    const taxasEstimadas = totalOperacoes * 0.15; // Taker fees estimate

    return {
      lucroLiquido24h,
      totalOperacoes,
      vitorias,
      derrotas,
      winRate: parseFloat(winRate.toFixed(1)),
      lucroMedioVitoria: parseFloat(lucroMedioVitoria.toFixed(2)),
      perdaMediaDerrota: parseFloat(perdaMediaDerrota.toFixed(2)),
      fatorLucro: parseFloat(fatorLucro.toFixed(2)),
      taxasEstimadas: parseFloat(taxasEstimadas.toFixed(2)),
      maiorLucro: parseFloat(maiorLucro.toFixed(2)),
      maiorPrejuizo: parseFloat(maiorPrejuizo.toFixed(2)),
      lucroPorTipoSaida: lucroPorTipoSaida as any,
      duracaoMediaMinutos: totalOperacoes > 0 ? Math.round(totalDuracao / totalOperacoes) : 0,
    };
  }

  // API ROUTES
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (username === AUTH_USER && password === AUTH_PASS) {
      res.json({ success: true, user: { username, isAuthenticated: true, loginTime: new Date().toISOString() } });
    } else {
      res.status(401).json({ success: false, message: "Usuário ou senha incorretos." });
    }
  });

  app.get("/api/stats", (req, res) => {
    // Recalculate margins and total
    const totalMargin = activePositions.reduce((acc, p) => acc + p.capitalEmRisco, 0);
    capitalState.capitalEmNegociacao = parseFloat(totalMargin.toFixed(2));
    capitalState.patrimonioTotal = parseFloat((capitalState.capitalLivre + capitalState.capitalEmNegociacao + capitalState.capitalCofre).toFixed(2));

    const audit = calculate24hAudit();
    capitalState.pnl24h = audit.lucroLiquido24h;
    capitalState.pnl24hPercent = parseFloat(((audit.lucroLiquido24h / capitalState.capitalInicial) * 100).toFixed(2));
    capitalState.totalTrades24h = audit.totalOperacoes;
    capitalState.winRate24h = audit.winRate;

    res.json({
      capital: capitalState,
      botStatus: {
        ...botStatus,
        posicoesSimultaneas: activePositions.length,
        horarioLocal: new Date().toLocaleTimeString('pt-BR')
      },
      audit24h: audit
    });
  });

  app.get("/api/positions", (req, res) => {
    res.json(activePositions);
  });

  app.get("/api/trades", (req, res) => {
    const { timeframe } = req.query; // '24h', '7d', '30d', 'all'
    let filtered = [...tradeLogs];

    if (timeframe === '24h') {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      filtered = tradeLogs.filter(t => new Date(t.dataHora).getTime() >= cutoff);
    } else if (timeframe === '7d') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filtered = tradeLogs.filter(t => new Date(t.dataHora).getTime() >= cutoff);
    }

    res.json(filtered);
  });

  app.get("/api/market-signals", (req, res) => {
    res.json(marketSignals);
  });

  app.post("/api/bot/toggle", (req, res) => {
    botStatus.isOnline = !botStatus.isOnline;
    botStatus.statusTexto = botStatus.isOnline ? "MOTOR V5.3 OPERANDO" : "MOTOR EM PAUSA";
    res.json({ success: true, isOnline: botStatus.isOnline, statusTexto: botStatus.statusTexto });
  });

  // Manual Trigger: Friday 22h Profit Sweep to Vault
  app.post("/api/bot/sweep-vault", (req, res) => {
    const lucroAcumuladoLivre = capitalState.capitalLivre - capitalState.capitalInicial;
    if (lucroAcumuladoLivre > 0) {
      const valorSaque = parseFloat(lucroAcumuladoLivre.toFixed(2));
      capitalState.capitalCofre += valorSaque;
      capitalState.capitalLivre = capitalState.capitalInicial;
      capitalState.baseCalculoDia = capitalState.capitalInicial;
      capitalState.gatilho40Ativado = false;

      // Add log
      const newLog: TradeLog = {
        id: `saque-${Date.now()}`,
        dataHora: new Date().toLocaleString('pt-BR'),
        moeda: 'SAQUE_SEXTA',
        tipoSaida: 'SAQUE_SEXTA',
        contratos: 0,
        precoMedio: 0,
        precoSaida: 0,
        numOrdens: 0,
        lucroLiquido: valorSaque,
        novoCaixa: capitalState.capitalLivre,
        categoria: 'MAJOR',
        duracaoMinutos: 0
      };
      tradeLogs.unshift(newLog);

      res.json({
        success: true,
        message: `Sucesso! R$ ${valorSaque.toFixed(2)} transferidos para o Cofre Seguro.`,
        capitalState
      });
    } else {
      res.json({
        success: false,
        message: `Não há lucro livre excedente para transferência no momento. Caixa Livre: R$ ${capitalState.capitalLivre.toFixed(2)}`,
        capitalState
      });
    }
  });

  // Simulate a live trading tick or trade event for demonstration / test
  app.post("/api/bot/simulate-tick", (req, res) => {
    const { action } = req.body; // 'take_profit' | 'stop_loss' | 'grid_add' | 'btc_crash'

    if (action === 'take_profit') {
      const profit = parseFloat((Math.random() * 8 + 4).toFixed(2));
      capitalState.capitalLivre += profit;

      const randomCoin = ['SOL/USDT', 'AVAX/USDT', 'LINK/USDT', 'FET/USDT', 'RENDER/USDT'][Math.floor(Math.random() * 5)];
      const log: TradeLog = {
        id: `sim-${Date.now()}`,
        dataHora: new Date().toLocaleString('pt-BR'),
        moeda: randomCoin,
        tipoSaida: 'TAKE_PROFIT',
        contratos: 25.5,
        precoMedio: 150.0,
        precoSaida: 153.2,
        numOrdens: 1,
        rsiEntrada: 62.1,
        varEntrada: 0.0055,
        lucroLiquido: profit,
        novoCaixa: parseFloat(capitalState.capitalLivre.toFixed(2)),
        categoria: 'ALT',
        duracaoMinutos: Math.floor(Math.random() * 25 + 5)
      };
      tradeLogs.unshift(log);

    } else if (action === 'stop_loss') {
      const loss = parseFloat((Math.random() * 15 + 15).toFixed(2));
      capitalState.capitalLivre -= loss;

      const randomCoin = ['ADA/USDT', 'DOT/USDT', 'SHIB/USDT', 'SUI/USDT'][Math.floor(Math.random() * 4)];
      const log: TradeLog = {
        id: `sim-${Date.now()}`,
        dataHora: new Date().toLocaleString('pt-BR'),
        moeda: randomCoin,
        tipoSaida: 'STOP_LOSS',
        contratos: 120,
        precoMedio: 1.50,
        precoSaida: 1.44,
        numOrdens: 1,
        rsiEntrada: 47.0,
        varEntrada: 0.0020,
        lucroLiquido: -loss,
        novoCaixa: parseFloat(capitalState.capitalLivre.toFixed(2)),
        categoria: 'ALT',
        duracaoMinutos: Math.floor(Math.random() * 20 + 10)
      };
      tradeLogs.unshift(log);

    } else if (action === 'btc_crash') {
      botStatus.btcCrashAtivo = true;
      botStatus.clima = "🆘 CRASH BTC — Suspensão temporária de novas entradas";
      botStatus.btcVar3 = -0.034; // -3.4%
      setTimeout(() => {
        botStatus.btcCrashAtivo = false;
        botStatus.clima = "⚡ SCALPING CRIPTO (RSI + EMA50 + Momentum)";
        botStatus.btcVar3 = 0.002;
      }, 20000);
    }

    res.json({ success: true, capitalState, botStatus, tradeLogs: tradeLogs.slice(0, 10) });
  });

  // Webhook for Python Bot (Railway -> Dashboard / Supabase Sync)
  app.post("/api/webhook/trade-log", (req, res) => {
    const { secret, trade } = req.body;
    if (secret !== (process.env.WEBHOOK_SECRET || "logusq_secret_2026")) {
      return res.status(403).json({ error: "Webhook secret inválido" });
    }

    if (trade) {
      tradeLogs.unshift({
        id: `wh-${Date.now()}`,
        dataHora: trade.dataHora || new Date().toLocaleString('pt-BR'),
        moeda: trade.moeda,
        tipoSaida: trade.tipoSaida,
        contratos: parseFloat(trade.contratos),
        precoMedio: parseFloat(trade.precoMedio),
        precoSaida: parseFloat(trade.precoSaida),
        numOrdens: parseInt(trade.numOrdens),
        rsiEntrada: parseFloat(trade.rsiEntrada),
        varEntrada: parseFloat(trade.varEntrada),
        lucroLiquido: parseFloat(trade.lucroLiquido),
        novoCaixa: parseFloat(trade.novoCaixa),
        categoria: trade.moeda.includes('BTC') || trade.moeda.includes('ETH') ? 'MAJOR' : 'ALT',
        duracaoMinutos: trade.duracaoMinutos || 15
      });

      if (trade.lucroLiquido) {
        capitalState.capitalLivre += parseFloat(trade.lucroLiquido);
      }
    }

    res.json({ success: true, message: "Operação registrada com sucesso no Dashboard!" });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor RobôCripto V5.3 ativo na porta ${PORT}`);
  });
}

startServer();
