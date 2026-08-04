export interface CapitalState {
  capitalInicial: number;
  capitalEmNegociacao: number; // Margem alocada
  capitalLivre: number;        // Caixa virtual
  capitalCofre: number;        // Caixa para saque (blindado)
  patrimonioTotal: number;     // Inicial + Lucros Acumulados
  baseCalculoDia: number;
  gatilho40Ativado: boolean;
  tiroDinamico: number;        // Valor da ordem (5% da base)
  pnl24h: number;
  pnl24hPercent: number;
  totalTrades24h: number;
  winRate24h: number;
}

export type ExitType = 'TAKE_PROFIT' | 'STOP_LOSS' | 'RESGATE_GRID' | 'SAQUE_SEXTA' | 'FECHAMENTO_MANUAL' | 'ENTRADA_PYTHON_V53' | 'TAKE_PROFIT_PYTHON_V53' | 'COMPRA_V53' | 'ENTRADA_AUTO_V53' | 'TAKE_PROFIT_AUTO_V53' | 'STOP_LOSS_AUTO_V53';

export interface TradeLog {
  id: string;
  dataHora: string;
  moeda: string;
  tipoSaida: ExitType;
  contratos: number;
  precoMedio: number;
  precoSaida: number;
  numOrdens: number;
  rsiEntrada?: number;
  varEntrada?: number;
  lucroLiquido: number;
  novoCaixa: number;
  categoria: 'MAJOR' | 'ALT';
  duracaoMinutos?: number;
}

export interface ActivePosition {
  moeda: string;
  contratos: number;
  precoMedio: number;
  precoAtual: number;
  numOrdens: number;
  maxOrdens: number;
  trailingAtivo: boolean;
  precoMaximo: number;
  atrEntrada: number;
  capitalEmRisco: number;
  rsiEntrada: number;
  varEntrada: number;
  pnlNaoRealizado: number;
  pnlPercent: number;
  categoria: 'MAJOR' | 'ALT';
  distanciaTrailing: number; // Distância em % para gatilho de recuo ou ativação
  proximoGatilhoGrid?: number;
}

export interface MarketSignal {
  moeda: string;
  precoAtual: number;
  atr: number;
  var3: number;              // Variação 3 velas 5m
  ema50: number;
  rsi: number;               // RSI 7
  volumeRatio: number;       // Vol / VolMedio 20
  categoria: 'MAJOR' | 'ALT';
  status: 'ELEGIVEL' | 'QUEDA_LIVRE' | 'RSI_FORA_FAIXA' | 'ABAIXO_EMA50' | 'COOLDOWN' | 'POSICAO_ABERTA';
  tendencia: 'ALTA' | 'BAIXA' | 'NEUTRA';
}

export interface BotStatus {
  isOnline: boolean;
  statusTexto: string;
  clima: string;
  btcCrashAtivo: boolean;
  btcCrashLiberadoEm?: string;
  btcVar3: number;
  fundingRateAtivo: boolean;
  horarioLocal: string;
  versao: string;
  posicoesSimultaneas: number;
  maxPosicoesSimultaneas: number;
}

export interface AuditSummary24h {
  lucroLiquido24h: number;
  totalOperacoes: number;
  vitorias: number;
  derrotas: number;
  winRate: number;
  lucroMedioVitoria: number;
  perdaMediaDerrota: number;
  fatorLucro: number;
  taxasEstimadas: number;
  maiorLucro: number;
  maiorPrejuizo: number;
  lucroPorTipoSaida: Partial<Record<ExitType, { count: number; totalPnL: number }>>;
  duracaoMediaMinutos: number;
}

export interface UserSession {
  isAuthenticated: boolean;
  username: string;
  loginTime?: string;
}
