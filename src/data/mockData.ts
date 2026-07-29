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
  capitalEmNegociacao: 150.00, // 3 posições abertas de $50 (5% de $1.000)
  capitalLivre: 984.60,
  capitalCofre: 285.40,        // Lucro acumulado no Cofre
  patrimonioTotal: 1420.00,    // Livre (984.60) + Margem (150.00) + Cofre (285.40)
  baseCalculoDia: 1000.00,
  gatilho40Ativado: false,
  tiroDinamico: 50.00,
  pnl24h: 114.20,
  pnl24hPercent: 11.42,
  totalTrades24h: 18,
  winRate24h: 83.3,
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
  posicoesSimultaneas: 3,
  maxPosicoesSimultaneas: 10
};

export const INITIAL_ACTIVE_POSITIONS: ActivePosition[] = [
  {
    moeda: 'SOL/USDT',
    contratos: 2.74,
    precoMedio: 182.45,
    precoAtual: 184.90,
    numOrdens: 1,
    maxOrdens: 3,
    trailingAtivo: true,
    precoMaximo: 185.20,
    atrEntrada: 1.85,
    capitalEmRisco: 50.00,
    rsiEntrada: 58.2,
    varEntrada: 0.0054,
    pnlNaoRealizado: 6.71,
    pnlPercent: 13.42,
    categoria: 'ALT',
    distanciaTrailing: -0.16, // % abaixo do topo
    proximoGatilhoGrid: 179.67
  },
  {
    moeda: 'ETH/USDT',
    contratos: 0.145,
    precoMedio: 3448.10,
    precoAtual: 3462.50,
    numOrdens: 1,
    maxOrdens: 3,
    trailingAtivo: true,
    precoMaximo: 3465.00,
    atrEntrada: 14.20,
    capitalEmRisco: 50.00,
    rsiEntrada: 61.5,
    varEntrada: 0.0038,
    pnlNaoRealizado: 2.08,
    pnlPercent: 4.17,
    categoria: 'MAJOR',
    distanciaTrailing: -0.07,
    proximoGatilhoGrid: 3426.80
  },
  {
    moeda: 'NEAR/USDT',
    contratos: 94.33,
    precoMedio: 5.30,
    precoAtual: 5.24,
    numOrdens: 2, // Reforço de Grid ativo!
    maxOrdens: 3,
    trailingAtivo: false,
    precoMaximo: 5.32,
    atrEntrada: 0.08,
    capitalEmRisco: 100.00,
    rsiEntrada: 49.8,
    varEntrada: 0.0021,
    pnlNaoRealizado: -5.65,
    pnlPercent: -5.65,
    categoria: 'ALT',
    distanciaTrailing: 0,
    proximoGatilhoGrid: 5.12
  }
];

// Seed recent trade history reflecting real CriptoV5.3 log output
export const INITIAL_TRADE_LOGS: TradeLog[] = [
  {
    id: 'trd-101',
    dataHora: new Date(Date.now() - 1000 * 60 * 22).toLocaleString('pt-BR'),
    moeda: 'AVAX/USDT',
    tipoSaida: 'TAKE_PROFIT',
    contratos: 15.62,
    precoMedio: 32.00,
    precoSaida: 32.48,
    numOrdens: 1,
    rsiEntrada: 59.4,
    varEntrada: 0.0062,
    lucroLiquido: 7.18,
    novoCaixa: 1134.60,
    categoria: 'ALT',
    duracaoMinutos: 14
  },
  {
    id: 'trd-100',
    dataHora: new Date(Date.now() - 1000 * 60 * 58).toLocaleString('pt-BR'),
    moeda: 'LINK/USDT',
    tipoSaida: 'RESGATE_GRID',
    contratos: 53.19,
    precoMedio: 18.80,
    precoSaida: 18.92,
    numOrdens: 2,
    rsiEntrada: 52.1,
    varEntrada: 0.0031,
    lucroLiquido: 5.84,
    novoCaixa: 1127.42,
    categoria: 'ALT',
    duracaoMinutos: 31
  },
  {
    id: 'trd-99',
    dataHora: new Date(Date.now() - 1000 * 60 * 115).toLocaleString('pt-BR'),
    moeda: 'FET/USDT',
    tipoSaida: 'TAKE_PROFIT',
    contratos: 384.61,
    precoMedio: 1.3000,
    precoSaida: 1.3210,
    numOrdens: 1,
    rsiEntrada: 64.0,
    varEntrada: 0.0078,
    lucroLiquido: 7.72,
    novoCaixa: 1121.58,
    categoria: 'ALT',
    duracaoMinutos: 18
  },
  {
    id: 'trd-98',
    dataHora: new Date(Date.now() - 1000 * 60 * 180).toLocaleString('pt-BR'),
    moeda: 'SUI/USDT',
    tipoSaida: 'STOP_LOSS',
    contratos: 263.15,
    precoMedio: 1.9000,
    precoSaida: 1.8240,
    numOrdens: 1,
    rsiEntrada: 48.5,
    varEntrada: 0.0022,
    lucroLiquido: -20.48,
    novoCaixa: 1113.86,
    categoria: 'ALT',
    duracaoMinutos: 25
  },
  {
    id: 'trd-97',
    dataHora: new Date(Date.now() - 1000 * 60 * 240).toLocaleString('pt-BR'),
    moeda: 'BTC/USDT',
    tipoSaida: 'TAKE_PROFIT',
    contratos: 0.0075,
    precoMedio: 66500.00,
    precoSaida: 67120.00,
    numOrdens: 1,
    rsiEntrada: 57.0,
    varEntrada: 0.0041,
    lucroLiquido: 4.38,
    novoCaixa: 1134.34,
    categoria: 'MAJOR',
    duracaoMinutos: 42
  },
  {
    id: 'trd-96',
    dataHora: new Date(Date.now() - 1000 * 60 * 310).toLocaleString('pt-BR'),
    moeda: 'RENDER/USDT',
    tipoSaida: 'TAKE_PROFIT',
    contratos: 83.33,
    precoMedio: 6.000,
    precoSaida: 6.095,
    numOrdens: 1,
    rsiEntrada: 62.3,
    varEntrada: 0.0051,
    lucroLiquido: 7.45,
    novoCaixa: 1129.96,
    categoria: 'ALT',
    duracaoMinutos: 22
  },
  {
    id: 'trd-95',
    dataHora: new Date(Date.now() - 1000 * 60 * 420).toLocaleString('pt-BR'),
    moeda: 'AAVE/USDT',
    tipoSaida: 'RESGATE_GRID',
    contratos: 0.625,
    precoMedio: 160.00,
    precoSaida: 161.10,
    numOrdens: 2,
    rsiEntrada: 51.0,
    varEntrada: 0.0025,
    lucroLiquido: 6.38,
    novoCaixa: 1122.51,
    categoria: 'ALT',
    duracaoMinutos: 55
  },
  {
    id: 'trd-94',
    dataHora: new Date(Date.now() - 1000 * 60 * 530).toLocaleString('pt-BR'),
    moeda: 'INJ/USDT',
    tipoSaida: 'TAKE_PROFIT',
    contratos: 22.72,
    precoMedio: 22.00,
    precoSaida: 22.38,
    numOrdens: 1,
    rsiEntrada: 66.1,
    varEntrada: 0.0084,
    lucroLiquido: 8.12,
    novoCaixa: 1116.13,
    categoria: 'ALT',
    duracaoMinutos: 15
  },
  {
    id: 'trd-93',
    dataHora: new Date(Date.now() - 1000 * 60 * 620).toLocaleString('pt-BR'),
    moeda: 'DOT/USDT',
    tipoSaida: 'STOP_LOSS',
    contratos: 83.33,
    precoMedio: 6.00,
    precoSaida: 5.76,
    numOrdens: 1,
    rsiEntrada: 46.2,
    varEntrada: 0.0021,
    lucroLiquido: -20.25,
    novoCaixa: 1108.01,
    categoria: 'ALT',
    duracaoMinutos: 20
  },
  {
    id: 'trd-92',
    dataHora: new Date(Date.now() - 1000 * 60 * 780).toLocaleString('pt-BR'),
    moeda: 'SAQUE_SEXTA',
    tipoSaida: 'SAQUE_SEXTA',
    contratos: 0,
    precoMedio: 0,
    precoSaida: 0,
    numOrdens: 0,
    lucroLiquido: 285.40,
    novoCaixa: 1000.00,
    categoria: 'MAJOR',
    duracaoMinutos: 0
  }
];

export const INITIAL_MARKET_SIGNALS: MarketSignal[] = [
  { moeda: 'BTC/USDT', precoAtual: 67250.00, atr: 145.0, var3: 0.0042, ema50: 66980.00, rsi: 58.4, volumeRatio: 1.1, categoria: 'MAJOR', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'ETH/USDT', precoAtual: 3462.50, atr: 14.2, var3: 0.0038, ema50: 3440.00, rsi: 61.5, volumeRatio: 1.2, categoria: 'MAJOR', status: 'POSICAO_ABERTA', tendencia: 'ALTA' },
  { moeda: 'SOL/USDT', precoAtual: 184.90, atr: 1.85, var3: 0.0054, ema50: 181.50, rsi: 58.2, volumeRatio: 1.4, categoria: 'ALT', status: 'POSICAO_ABERTA', tendencia: 'ALTA' },
  { moeda: 'LINK/USDT', precoAtual: 19.10, atr: 0.22, var3: 0.0048, ema50: 18.85, rsi: 56.1, volumeRatio: 1.0, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'AVAX/USDT', precoAtual: 32.65, atr: 0.45, var3: 0.0031, ema50: 32.10, rsi: 54.8, volumeRatio: 0.9, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'DOGE/USDT', precoAtual: 0.1420, atr: 0.0025, var3: -0.0012, ema50: 0.1435, rsi: 41.2, volumeRatio: 0.8, categoria: 'ALT', status: 'RSI_FORA_FAIXA', tendencia: 'BAIXA' },
  { moeda: 'SHIB/USDT', precoAtual: 0.0000185, atr: 0.0000003, var3: 0.0015, ema50: 0.0000182, rsi: 51.0, volumeRatio: 0.7, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'NEUTRA' },
  { moeda: 'FET/USDT', precoAtual: 1.345, atr: 0.028, var3: 0.0062, ema50: 1.310, rsi: 63.8, volumeRatio: 1.8, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'RENDER/USDT', precoAtual: 6.12, atr: 0.09, var3: 0.0028, ema50: 6.02, rsi: 55.4, volumeRatio: 1.1, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'ADA/USDT', precoAtual: 0.412, atr: 0.006, var3: -0.0160, ema50: 0.425, rsi: 38.5, volumeRatio: 2.8, categoria: 'ALT', status: 'QUEDA_LIVRE', tendencia: 'BAIXA' },
  { moeda: 'DOT/USDT', precoAtual: 5.82, atr: 0.08, var3: -0.0005, ema50: 5.95, rsi: 42.0, volumeRatio: 0.9, categoria: 'ALT', status: 'COOLDOWN', tendencia: 'BAIXA' },
  { moeda: 'LTC/USDT', precoAtual: 74.20, atr: 0.85, var3: 0.0035, ema50: 73.50, rsi: 57.1, volumeRatio: 1.0, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'NEAR/USDT', precoAtual: 5.24, atr: 0.08, var3: -0.0010, ema50: 5.32, rsi: 49.8, volumeRatio: 1.2, categoria: 'ALT', status: 'POSICAO_ABERTA', tendencia: 'NEUTRA' },
  { moeda: 'FIL/USDT', precoAtual: 4.85, atr: 0.06, var3: 0.0022, ema50: 4.81, rsi: 52.3, volumeRatio: 0.8, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'INJ/USDT', precoAtual: 22.85, atr: 0.35, var3: 0.0051, ema50: 22.30, rsi: 60.2, volumeRatio: 1.3, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'ALTA' },
  { moeda: 'SUI/USDT', precoAtual: 1.88, atr: 0.035, var3: 0.0018, ema50: 1.89, rsi: 47.1, volumeRatio: 1.1, categoria: 'ALT', status: 'ELEGIVEL', tendencia: 'NEUTRA' }
];
