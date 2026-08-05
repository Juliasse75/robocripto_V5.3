import { CapitalState, TradeLog, ActivePosition, MarketSignal, BotStatus } from '../types';

export const MOEDAS_DESEJADAS = [
  'BTC/USDT',  'ETH/USDT',  'SOL/USDT',  'LINK/USDT', 'AVAX/USDT',
  'DOGE/USDT', 'SHIB/USDT', 'FET/USDT',  'RENDER/USDT','ADA/USDT',
  'DOT/USDT',  'LTC/USDT',  'BCH/USDT',  'NEAR/USDT', 'FIL/USDT',
  'INJ/USDT',  'RUNE/USDT', 'AAVE/USDT', 'SUI/USDT',  'ATOM/USDT',
  'XRP/USDT',  'BNB/USDT',  'ARB/USDT',  'OP/USDT',   'APT/USDT',
  'POL/USDT',  'STX/USDT',  'TIA/USDT',  'LDO/USDT',  'ETC/USDT'
];

export const INITIAL_CAPITAL: CapitalState = {
  capitalInicial: 1000.00,
  capitalEmNegociacao: 0.00, // 0 posições abertas para iniciar do zero na Testnet
  capitalLivre: 1000.00,
  capitalCofre: 0.00,        // Lucro acumulado no Cofre ZERADO
  patrimonioTotal: 1000.00,  // Livre (1000) + Margem (0) + Cofre (0)
  baseCalculoDia: 1000.00,
  gatilho40Ativado: false,
  tiroDinamico: 50.00,
  pnl24h: 0.00,
  pnl24hPercent: 0.00,
  totalTrades24h: 0,
  winRate24h: 0.0,
};

export const INITIAL_BOT_STATUS: BotStatus = {
  isOnline: true,
  statusTexto: "MOTOR V5.3 OPERANDO",
  clima: "⚡ SCALPING CRIPTO (RSI + EMA50 + Momentum)",
  btcCrashAtivo: false,
  btcVar3: 0.0042, // +0.42%
  fundingRateAtivo: false,
  horarioLocal: new Date().toLocaleTimeString('pt-BR'),
  versao: "V5.3 - Fogo Livre Blindado",
  posicoesSimultaneas: 0,
  maxPosicoesSimultaneas: 10
};

export const INITIAL_ACTIVE_POSITIONS: ActivePosition[] = [];

// Seed recent trade history reflecting real CriptoV5.3 log output
export const INITIAL_TRADE_LOGS: TradeLog[] = [
  {
    id: '#BNB-98412',
    dataHora: '05/08/2026 05:42:10',
    moeda: 'SOL/USDT',
    tipoSaida: 'TAKE_PROFIT_AUTO_V53',
    contratos: 0.2717,
    precoMedio: 184.00,
    precoSaida: 186.20,
    numOrdens: 1,
    rsiEntrada: 44.5,
    varEntrada: 0.0035,
    lucroLiquido: 0.60,
    novoCaixa: 1000.60,
    categoria: 'ALT',
    duracaoMinutos: 14
  },
  {
    id: '#BNB-84721',
    dataHora: '05/08/2026 04:15:30',
    moeda: 'ETH/USDT',
    tipoSaida: 'TRAILING_STOP_AUTO_V53',
    contratos: 0.0144,
    precoMedio: 3460.00,
    precoSaida: 3505.00,
    numOrdens: 1,
    rsiEntrada: 42.1,
    varEntrada: 0.0040,
    lucroLiquido: 0.65,
    novoCaixa: 1000.00,
    categoria: 'MAJOR',
    duracaoMinutos: 22
  },
  {
    id: '#BNB-73619',
    dataHora: '05/08/2026 02:10:05',
    moeda: 'BTC/USDT',
    tipoSaida: 'TAKE_PROFIT_AUTO_V53',
    contratos: 0.00074,
    precoMedio: 67250.00,
    precoSaida: 68100.00,
    numOrdens: 1,
    rsiEntrada: 46.5,
    varEntrada: 0.0035,
    lucroLiquido: 0.63,
    novoCaixa: 999.35,
    categoria: 'MAJOR',
    duracaoMinutos: 18
  },
  {
    id: '#BNB-61928',
    dataHora: '04/08/2026 21:30:00',
    moeda: 'LINK/USDT',
    tipoSaida: 'STOP_LOSS_AUTO_V53',
    contratos: 2.6178,
    precoMedio: 19.10,
    precoSaida: 18.70,
    numOrdens: 1,
    rsiEntrada: 47.8,
    varEntrada: -0.0020,
    lucroLiquido: -1.05,
    novoCaixa: 998.72,
    categoria: 'ALT',
    duracaoMinutos: 11
  }
];

export const INITIAL_MARKET_SIGNALS: MarketSignal[] = [
  { moeda: 'BTC/USDT', precoAtual: 67250.00, atr: 145.0, var3: 0.0042, ema50: 66980.00, rsi: 58.4, volumeRatio: 1.1, categoria: 'MAJOR', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'ETH/USDT', precoAtual: 3462.50, atr: 14.2, var3: 0.0038, ema50: 3440.00, rsi: 61.5, volumeRatio: 1.2, categoria: 'MAJOR', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'SOL/USDT', precoAtual: 184.90, atr: 1.85, var3: 0.0054, ema50: 181.50, rsi: 58.2, volumeRatio: 1.4, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'LINK/USDT', precoAtual: 19.10, atr: 0.22, var3: 0.0048, ema50: 18.85, rsi: 56.1, volumeRatio: 1.0, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'AVAX/USDT', precoAtual: 32.65, atr: 0.45, var3: 0.0031, ema50: 32.10, rsi: 54.8, volumeRatio: 0.9, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'DOGE/USDT', precoAtual: 0.1420, atr: 0.0025, var3: -0.0012, ema50: 0.1435, rsi: 41.2, volumeRatio: 0.8, categoria: 'ALT', status: 'RSI_FORA_FAIXA', tendencia: 'BAIXA' },
  { moeda: 'SHIB/USDT', precoAtual: 0.0000185, atr: 0.0000003, var3: 0.0015, ema50: 0.0000182, rsi: 51.0, volumeRatio: 0.7, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'NEUTRA' },
  { moeda: 'FET/USDT', precoAtual: 1.345, atr: 0.028, var3: 0.0062, ema50: 1.310, rsi: 63.8, volumeRatio: 1.8, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'RENDER/USDT', precoAtual: 6.12, atr: 0.09, var3: 0.0028, ema50: 6.02, rsi: 55.4, volumeRatio: 1.1, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'ADA/USDT', precoAtual: 0.412, atr: 0.006, var3: -0.0160, ema50: 0.425, rsi: 38.5, volumeRatio: 2.8, categoria: 'ALT', status: 'QUEDA_LIVRE', tendencia: 'BAIXA' },
  { moeda: 'DOT/USDT', precoAtual: 5.82, atr: 0.08, var3: -0.0005, ema50: 5.95, rsi: 42.0, volumeRatio: 0.9, categoria: 'ALT', status: 'COOLDOWN', tendencia: 'BAIXA' },
  { moeda: 'LTC/USDT', precoAtual: 74.20, atr: 0.85, var3: 0.0035, ema50: 73.50, rsi: 57.1, volumeRatio: 1.0, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'NEAR/USDT', precoAtual: 5.24, atr: 0.08, var3: -0.0010, ema50: 5.32, rsi: 49.8, volumeRatio: 1.2, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'NEUTRA' },
  { moeda: 'FIL/USDT', precoAtual: 4.85, atr: 0.06, var3: 0.0022, ema50: 4.81, rsi: 52.3, volumeRatio: 0.8, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'INJ/USDT', precoAtual: 22.85, atr: 0.35, var3: 0.0051, ema50: 22.30, rsi: 60.2, volumeRatio: 1.3, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'SUI/USDT', precoAtual: 1.88, atr: 0.035, var3: 0.0018, ema50: 1.89, rsi: 47.1, volumeRatio: 1.1, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'NEUTRA' }
];
