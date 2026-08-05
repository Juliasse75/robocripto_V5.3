/**
 * @file cpcvEvaluator.ts
 * @description Módulo de Avaliação de Robustez Quantitativa via CPCV (Combinatorial Purged & Embargoed Cross-Validation).
 * Simula a execução de estratégias financeiras em cada caminho combinatorial e calcula métricas estatísticas
 * como Índice de Sharpe Anualizado, Retorno Acumulado, Volatilidade e Média de Robustez.
 */

import { CombinatorialSplitPath, KlineCandle } from "./combinatorialSplitter";

export interface StrategyParams {
  rsiPeriod?: number;
  rsiOversold?: number;
  rsiOverbought?: number;
  takeProfitPct?: number; // Ex: 0.015 = 1.5%
  stopLossPct?: number;   // Ex: 0.01 = 1.0%
  feePct?: number;         // Ex: 0.0005 = 0.05% por trade
}

export interface PathEvaluationResult {
  splitId: number;
  testBlockIndices: number[];
  trainBlockIndices: number[];
  trainCandleCount: number;
  testCandleCount: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number; // Em percentual (0 - 100%)
  accumulatedReturn: number; // Em percentual (ex: 4.5 = +4.5%)
  volatility: number; // Desvio padrão dos retornos (%)
  sharpeRatio: number; // Sharpe Ratio Anualizado
  maxDrawdown: number; // Maior queda (%)
  profitFactor: number;
}

export interface CPCVReportJSON {
  timestamp: string;
  totalPaths: number;
  averageSharpe: number;
  sharpeStdDev: number;
  minSharpe: number;
  maxSharpe: number;
  positivePathsPercent: number;
  averageAccumulatedReturn: number;
  averageWinRate: number;
  averageMaxDrawdown: number;
  paths: PathEvaluationResult[];
  /** Dados formatados especialmente para renderização direta no Recharts (AnalyticsCharts.tsx) */
  chartData: {
    pathLabel: string;
    sharpe: number;
    returnPct: number;
    winRate: number;
    drawdown: number;
  }[];
}

/**
 * Simula a execução de uma estratégia baseada em RSI / Trend Following sobre um conjunto de velas.
 * Retorna o histórico de retornos percentuais de cada operação realizada.
 */
export function simulateStrategyOnCandles<T extends KlineCandle>(
  candles: T[],
  params: StrategyParams = {}
): { returns: number[]; trades: number } {
  const {
    rsiPeriod = 14,
    rsiOversold = 45,
    takeProfitPct = 0.012, // 1.2%
    stopLossPct = 0.008,   // 0.8%
    feePct = 0.0005,       // 0.05%
  } = params;

  if (!candles || candles.length < rsiPeriod + 1) {
    return { returns: [], trades: 0 };
  }

  const returns: number[] = [];
  let inPosition = false;
  let entryPrice = 0;

  // Calcular retornos simples para RSI
  const priceChanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    priceChanges.push(candles[i].close - candles[i - 1].close);
  }

  for (let i = rsiPeriod; i < candles.length; i++) {
    const currentCandle = candles[i];

    if (!inPosition) {
      // Cálculo simplificado de RSI para os últimos N candles
      let gains = 0;
      let losses = 0;
      for (let j = i - rsiPeriod; j < i; j++) {
        const change = priceChanges[j - 1] || 0;
        if (change >= 0) gains += change;
        else losses += Math.abs(change);
      }

      const avgGain = gains / rsiPeriod;
      const avgLoss = losses / rsiPeriod;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);

      // Sinal de entrada: RSI sobrevendido
      if (rsi <= rsiOversold) {
        inPosition = true;
        entryPrice = currentCandle.close;
      }
    } else {
      // Gerenciar posição aberta
      const priceRatio = (currentCandle.close - entryPrice) / entryPrice;

      // Verificar gatinhos de saída (Take Profit ou Stop Loss)
      if (priceRatio >= takeProfitPct) {
        const netReturn = takeProfitPct - feePct * 2;
        returns.push(netReturn);
        inPosition = false;
      } else if (priceRatio <= -stopLossPct) {
        const netReturn = -stopLossPct - feePct * 2;
        returns.push(netReturn);
        inPosition = false;
      }
    }
  }

  return { returns, trades: returns.length };
}

/**
 * Avalia uma série de retornos percentuais individuais de trades para extrair métricas de Sharpe, Volatilidade e Drawdown.
 *
 * @param returns Array de retornos de cada trade (ex: [0.012, -0.008, 0.015])
 * @param annualizationFactor Fator de anualização (default: sqrt(365 * 24) para escala intradiária/horária)
 */
export function calculatePerformanceMetrics(
  returns: number[],
  annualizationFactor: number = Math.sqrt(365 * 24)
): {
  accumulatedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
} {
  if (!returns || returns.length === 0) {
    return {
      accumulatedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      profitFactor: 0,
    };
  }

  let cumulativeCapital = 1.0;
  let maxCapital = 1.0;
  let maxDrawdown = 0;

  let totalWin = 0;
  let totalLoss = 0;
  let winningTrades = 0;
  let losingTrades = 0;

  returns.forEach((r) => {
    cumulativeCapital *= 1 + r;
    if (cumulativeCapital > maxCapital) {
      maxCapital = cumulativeCapital;
    }
    const currentDrawdown = (maxCapital - cumulativeCapital) / maxCapital;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    if (r > 0) {
      winningTrades++;
      totalWin += r;
    } else if (r < 0) {
      losingTrades++;
      totalLoss += Math.abs(r);
    }
  });

  const accumulatedReturnPct = (cumulativeCapital - 1) * 100;
  const totalTrades = returns.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const profitFactor = totalLoss > 0 ? totalWin / totalLoss : totalWin > 0 ? 99 : 0;

  // Cálculo da Volatilidade (Desvio Padrão Amostral dos Retornos)
  const meanReturn = returns.reduce((a, b) => a + b, 0) / totalTrades;
  const variance =
    totalTrades > 1
      ? returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (totalTrades - 1)
      : 0;
  const volatility = Math.sqrt(variance);

  // Sharpe Ratio Anualizado: (Média / Volatilidade) * sqrt(Fator)
  // Rf = 0 para ativos cripto sem taxa livre de risco fixa
  let sharpeRatio = 0;
  if (volatility > 0) {
    sharpeRatio = (meanReturn / volatility) * annualizationFactor;
  } else if (meanReturn > 0) {
    sharpeRatio = 3.0; // Teto razoável quando a variância é zero com lucros consistentes
  }

  return {
    accumulatedReturn: parseFloat(accumulatedReturnPct.toFixed(2)),
    volatility: parseFloat((volatility * 100).toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
    winningTrades,
    losingTrades,
    winRate: parseFloat(winRate.toFixed(1)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
  };
}

/**
 * Avalia os caminhos (paths) gerados pelo CPCV executando a simulação de estratégia em cada bloco de TESTE.
 * Retorna um relatório quantitativo em formato JSON limpo e pronto para o frontend.
 *
 * @param paths Array de caminhos CPCV gerados por CombinatorialTimeSeriesSplitter
 * @param strategyParams Parâmetros configuráveis para a simulação da estratégia
 * @returns CPCVReportJSON Estrutura completa pronta para exibição no AnalyticsCharts.tsx
 */
export function evaluateCPCVPaths<T extends KlineCandle>(
  paths: CombinatorialSplitPath<T>[],
  strategyParams: StrategyParams = {}
): CPCVReportJSON {
  if (!paths || paths.length === 0) {
    return {
      timestamp: new Date().toISOString(),
      totalPaths: 0,
      averageSharpe: 0,
      sharpeStdDev: 0,
      minSharpe: 0,
      maxSharpe: 0,
      positivePathsPercent: 0,
      averageAccumulatedReturn: 0,
      averageWinRate: 0,
      averageMaxDrawdown: 0,
      paths: [],
      chartData: [],
    };
  }

  const pathResults: PathEvaluationResult[] = paths.map((path) => {
    // Executar simulação no conjunto de TESTE deste caminho
    const { returns, trades } = simulateStrategyOnCandles(path.testData, strategyParams);
    const metrics = calculatePerformanceMetrics(returns);

    return {
      splitId: path.splitId,
      testBlockIndices: path.testBlockIndices,
      trainBlockIndices: path.trainBlockIndices,
      trainCandleCount: path.trainData.length,
      testCandleCount: path.testData.length,
      totalTrades: trades,
      winningTrades: metrics.winningTrades,
      losingTrades: metrics.losingTrades,
      winRate: metrics.winRate,
      accumulatedReturn: metrics.accumulatedReturn,
      volatility: metrics.volatility,
      sharpeRatio: metrics.sharpeRatio,
      maxDrawdown: metrics.maxDrawdown,
      profitFactor: metrics.profitFactor,
    };
  });

  // Estatísticas Globais dos Caminhos CPCV
  const sharpeValues = pathResults.map((p) => p.sharpeRatio);
  const returnsValues = pathResults.map((p) => p.accumulatedReturn);
  const winRateValues = pathResults.map((p) => p.winRate);
  const drawdownValues = pathResults.map((p) => p.maxDrawdown);

  const sumSharpe = sharpeValues.reduce((a, b) => a + b, 0);
  const averageSharpe = sumSharpe / pathResults.length;

  // Desvio padrão do Sharpe entre caminhos
  const sharpeVariance =
    pathResults.length > 1
      ? sharpeValues.reduce((sum, s) => sum + Math.pow(s - averageSharpe, 2), 0) /
        (pathResults.length - 1)
      : 0;
  const sharpeStdDev = Math.sqrt(sharpeVariance);

  const minSharpe = Math.min(...sharpeValues);
  const maxSharpe = Math.max(...sharpeValues);
  const positivePathsCount = sharpeValues.filter((s) => s > 0).length;
  const positivePathsPercent = (positivePathsCount / pathResults.length) * 100;

  const averageAccumulatedReturn =
    returnsValues.reduce((a, b) => a + b, 0) / pathResults.length;
  const averageWinRate = winRateValues.reduce((a, b) => a + b, 0) / pathResults.length;
  const averageMaxDrawdown =
    drawdownValues.reduce((a, b) => a + b, 0) / pathResults.length;

  // Formatação para Recharts em AnalyticsCharts.tsx
  const chartData = pathResults.map((p) => ({
    pathLabel: `Path #${p.splitId} [${p.testBlockIndices.join(",")}]`,
    sharpe: p.sharpeRatio,
    returnPct: p.accumulatedReturn,
    winRate: p.winRate,
    drawdown: p.maxDrawdown,
  }));

  return {
    timestamp: new Date().toISOString(),
    totalPaths: pathResults.length,
    averageSharpe: parseFloat(averageSharpe.toFixed(2)),
    sharpeStdDev: parseFloat(sharpeStdDev.toFixed(2)),
    minSharpe: parseFloat(minSharpe.toFixed(2)),
    maxSharpe: parseFloat(maxSharpe.toFixed(2)),
    positivePathsPercent: parseFloat(positivePathsPercent.toFixed(1)),
    averageAccumulatedReturn: parseFloat(averageAccumulatedReturn.toFixed(2)),
    averageWinRate: parseFloat(averageWinRate.toFixed(1)),
    averageMaxDrawdown: parseFloat(averageMaxDrawdown.toFixed(2)),
    paths: pathResults,
    chartData,
  };
}
