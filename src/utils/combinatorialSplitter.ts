/**
 * @file combinatorialSplitter.ts
 * @description Módulo de Divisão de Séries Temporais Financeiras via Combinações Matemáticas (Combinatorial Cross-Validation).
 * Utilizado por sistemas quantitativos para validação cruzada robusta sem viés de sobrevivência ou contaminação temporal.
 */

export interface KlineCandle {
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  [key: string]: any;
}

export interface BlockSummary {
  blockIndex: number;
  startTime: number;
  endTime: number;
  candleCount: number;
  isTest: boolean;
}

export interface CombinatorialSplitPath<T extends KlineCandle = KlineCandle> {
  splitId: number;
  testBlockIndices: number[];
  trainBlockIndices: number[];
  trainData: T[];
  testData: T[];
  blocksSummary: BlockSummary[];
}

export interface SplitterConfig {
  /** Número total de blocos N em que a série temporal será dividida (ex: 6) */
  nBlocks: number;
  /** Número de blocos k selecionados para teste em cada combinação (ex: 2) */
  kTestBlocks: number;
  /** Duração máxima de uma operação em milissegundos para Purging (ex: 4h = 4 * 60 * 60 * 1000 ms) */
  maxTradeDurationMs?: number;
  /** Percentual de embargo (0.01 a 0.05 = 1% a 5%) ou janela em ms a ser descartada imediatamente APÓS o término de cada bloco de teste */
  embargoPercentage?: number;
  /** Duração exata da janela de embargo em milissegundos (opcional, substitui embargoPercentage) */
  embargoDurationMs?: number;
  /** Opcional: janela de eliminação em número de candles */
  purgeWindowCandles?: number;
}

export type TestBlockTimeInput = number | { startTime: number; endTime?: number };

/**
 * Aplica a regra de Embargo (Embargoing) aos dados de treino.
 * Descarta velas/amostras que iniciem dentro de uma janela imediatamente APÓS o término de qualquer bloco de teste.
 * 
 * Isso elimina contaminações causadas por memória de mercado, autocorrelação residual e inércia temporal.
 *
 * @param trainData Array de amostras de treino
 * @param testBlocksEndTimes Array de timestamps onde os blocos de teste terminaram
 * @param embargoDurationMs Duração da janela de embargo em milissegundos
 * @param chunkSize Quantidade de itens por ciclo do Event Loop (default: 5000)
 * @returns Array de treino filtrado sem os períodos embargados
 */
export async function applyEmbargo<T extends KlineCandle>(
  trainData: T[],
  testBlocksEndTimes: number[],
  embargoDurationMs: number,
  chunkSize: number = 5000
): Promise<T[]> {
  if (!trainData || trainData.length === 0) return [];
  if (!testBlocksEndTimes || testBlocksEndTimes.length === 0 || embargoDurationMs <= 0) {
    return [...trainData];
  }

  const cleanTrainData: T[] = [];
  const total = trainData.length;

  for (let i = 0; i < total; i++) {
    const sample = trainData[i];
    const sampleTime = sample.openTime || sample.closeTime || 0;

    let isEmbargoed = false;

    for (let j = 0; j < testBlocksEndTimes.length; j++) {
      const testEnd = testBlocksEndTimes[j];
      const embargoEnd = testEnd + embargoDurationMs;

      // Se a amostra de treino inicia na janela logo após o fim do teste, ela é descartada
      if (sampleTime >= testEnd && sampleTime <= embargoEnd) {
        isEmbargoed = true;
        break;
      }
    }

    if (!isEmbargoed) {
      cleanTrainData.push(sample);
    }

    // Liberar o Event Loop do Node.js periodicamente
    if (i > 0 && i % chunkSize === 0) {
      await new Promise<void>((resolve) => setImmediate ? setImmediate(resolve) : setTimeout(resolve, 0));
    }
  }

  return cleanTrainData;
}

/**
 * Função assíncrona otimizada para expurgar (purger) amostras do conjunto de treino que
 * possam sobrepor o período de vigência dos blocos de teste.
 * 
 * Evita o contágio temporal (data leakage) liberando periodicamente o Event Loop do Node.js.
 *
 * @param trainData Array de amostras ou velas de treino
 * @param testBlocksTime Array com os timestamps de início e fim dos blocos de teste
 * @param maxTradeDurationMs Duração máxima estimada de uma operação em milissegundos
 * @param chunkSize Quantidade de itens processados por ciclo do Event Loop (default: 5000)
 * @returns Array de treino purgado sem risco de vazamento de dados
 */
export async function purgeTrainingData<T extends KlineCandle>(
  trainData: T[],
  testBlocksTime: TestBlockTimeInput[],
  maxTradeDurationMs: number,
  chunkSize: number = 5000
): Promise<T[]> {
  if (!trainData || trainData.length === 0) return [];
  if (!testBlocksTime || testBlocksTime.length === 0) return [...trainData];

  // Normalizar intervalos de teste para [{ startTime, endTime }]
  const testIntervals = testBlocksTime.map((item) => {
    if (typeof item === 'number') {
      return { startTime: item, endTime: Infinity };
    }
    return {
      startTime: item.startTime,
      endTime: item.endTime ?? Infinity,
    };
  });

  const purgedTrainData: T[] = [];
  const total = trainData.length;

  for (let i = 0; i < total; i++) {
    const sample = trainData[i];
    const sampleStartTime = sample.openTime || sample.closeTime || 0;
    const sampleEndTime = sampleStartTime + maxTradeDurationMs;

    // Verificar se a amostra invade a janela de qualquer bloco de teste
    let hasLeakage = false;

    for (let j = 0; j < testIntervals.length; j++) {
      const { startTime: testStart, endTime: testEnd } = testIntervals[j];

      // A operação invadiu o teste se:
      // 1. Iniciou antes do teste mas a duração da operação avança para dentro do teste
      // 2. Ou iniciou dentro do próprio intervalo de teste
      const overlapsTestStart = sampleStartTime < testStart && sampleEndTime > testStart;
      const insideTestInterval = sampleStartTime >= testStart && sampleStartTime < testEnd;

      if (overlapsTestStart || insideTestInterval) {
        hasLeakage = true;
        break;
      }
    }

    if (!hasLeakage) {
      purgedTrainData.push(sample);
    }

    // Liberar o Event Loop a cada N iterações para não travar o servidor Node.js
    if (i > 0 && i % chunkSize === 0) {
      await new Promise<void>((resolve) => setImmediate ? setImmediate(resolve) : setTimeout(resolve, 0));
    }
  }

  return purgedTrainData;
}

export class CombinatorialTimeSeriesSplitter {
  /**
   * Calcula o fatorial de um número inteiro não-negativo.
   */
  public static factorial(n: number): number {
    if (n < 0) throw new Error("Fatorial não é definido para números negativos.");
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  /**
   * Calcula a quantidade de combinações possíveis: C(N, k) = N! / (k! * (N - k)!)
   */
  public static calculateCombinationsCount(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    return Math.round(
      this.factorial(n) / (this.factorial(k) * this.factorial(n - k))
    );
  }

  /**
   * Gera todas as combinações únicas de k índices a partir de N elementos [0, 1, ..., N-1].
   */
  public static generateIndexCombinations(n: number, k: number): number[][] {
    const combinations: number[][] = [];

    function backtrack(start: number, currentCombination: number[]) {
      if (currentCombination.length === k) {
        combinations.push([...currentCombination]);
        return;
      }
      for (let i = start; i < n; i++) {
        currentCombination.push(i);
        backtrack(i + 1, currentCombination);
        currentCombination.pop();
      }
    }

    backtrack(0, []);
    return combinations;
  }

  /**
   * Purga amostras de treino para evitar contaminação por sobreposição temporal.
   */
  public static async purgeTrainingData<T extends KlineCandle>(
    trainData: T[],
    testBlocksTime: TestBlockTimeInput[],
    maxTradeDurationMs: number,
    chunkSize: number = 5000
  ): Promise<T[]> {
    return purgeTrainingData(trainData, testBlocksTime, maxTradeDurationMs, chunkSize);
  }

  /**
   * Aplica janela de embargo aos dados de treino imediatamente após os blocos de teste.
   */
  public static async applyEmbargo<T extends KlineCandle>(
    trainData: T[],
    testBlocksEndTimes: number[],
    embargoDurationMs: number,
    chunkSize: number = 5000
  ): Promise<T[]> {
    return applyEmbargo(trainData, testBlocksEndTimes, embargoDurationMs, chunkSize);
  }

  /**
   * Pipeline Completa de Combinatorial Purged & Embargoed Cross-Validation (CPCV).
   * Orquestra a Divisão Combinatória C(N, k), o Expurgo (Purging) e o Embargo (Embargoing)
   * em um único fluxo quantitativo assíncrono e isolado.
   *
   * @param klines Array ordenado cronologicamente de velas
   * @param config Configuração completa de divisão, purging e embargo
   * @returns Array com os caminhos totalmente isolados de treino e teste
   */
  public static async runPipeline<T extends KlineCandle>(
    klines: T[],
    config: SplitterConfig
  ): Promise<CombinatorialSplitPath<T>[]> {
    // 1. Etapa 1: Divisão Combinatória Base C(N, k)
    const baseSplits = this.split(klines, config);

    // Calcular a duração do embargo se for baseado em percentual
    let calculatedEmbargoMs = config.embargoDurationMs || 0;
    if (!calculatedEmbargoMs && config.embargoPercentage && config.embargoPercentage > 0 && klines.length > 0) {
      const firstTime = klines[0].openTime || klines[0].closeTime || 0;
      const lastTime = klines[klines.length - 1].closeTime || klines[klines.length - 1].openTime || 0;
      const totalTimeSpan = Math.max(0, lastTime - firstTime);
      
      // Embargo calculado em relação ao tempo total da série temporal
      calculatedEmbargoMs = totalTimeSpan * config.embargoPercentage;
    }

    const processedSplits: CombinatorialSplitPath<T>[] = [];

    // 2. Etapa 2 e 3: Processar cada caminho executando Purging e Embargo
    for (const splitPath of baseSplits) {
      let currentTrainData = splitPath.trainData;

      // Extrair informações de tempo dos blocos de teste
      const testBlocksSummary = splitPath.blocksSummary.filter((b) => b.isTest);
      const testBlocksIntervals = testBlocksSummary.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
      }));
      const testBlocksEndTimes = testBlocksSummary.map((b) => b.endTime);

      // Aplicação de PURGING
      if (config.maxTradeDurationMs && config.maxTradeDurationMs > 0) {
        currentTrainData = await this.purgeTrainingData(
          currentTrainData,
          testBlocksIntervals,
          config.maxTradeDurationMs
        );
      }

      // Aplicação de EMBARGO
      if (calculatedEmbargoMs > 0) {
        currentTrainData = await this.applyEmbargo(
          currentTrainData,
          testBlocksEndTimes,
          calculatedEmbargoMs
        );
      }

      processedSplits.push({
        ...splitPath,
        trainData: currentTrainData,
      });
    }

    return processedSplits;
  }

  /**
   * Alias legado para splitWithPurgingAndEmbargo
   */
  public static async splitWithPurgingAndEmbargo<T extends KlineCandle>(
    klines: T[],
    config: SplitterConfig
  ): Promise<CombinatorialSplitPath<T>[]> {
    return this.runPipeline(klines, config);
  }

  /**
   * Divide uma série temporal em N blocos e gera os caminhos C(N, k) com Purging automático.
   */
  public static async splitWithPurging<T extends KlineCandle>(
    klines: T[],
    config: SplitterConfig
  ): Promise<CombinatorialSplitPath<T>[]> {
    return this.runPipeline(klines, config);
  }

  /**
   * Divide uma série temporal de velas (klines) em N blocos contínuos e gera os caminhos de Treino/Teste
   * baseados em todas as combinações C(N, k).
   */
  public static split<T extends KlineCandle>(
    klines: T[],
    config: SplitterConfig
  ): CombinatorialSplitPath<T>[] {
    const { nBlocks, kTestBlocks, purgeWindowCandles = 0 } = config;

    if (!klines || klines.length === 0) {
      throw new Error("O array de velas (klines) não pode estar vazio.");
    }
    if (nBlocks <= 0 || kTestBlocks <= 0) {
      throw new Error("nBlocks e kTestBlocks devem ser números inteiros positivos.");
    }
    if (kTestBlocks >= nBlocks) {
      throw new Error("kTestBlocks deve ser estritamente menor que nBlocks.");
    }
    if (klines.length < nBlocks) {
      throw new Error(
        `A quantidade de velas (${klines.length}) é menor que o número de blocos solicitados (${nBlocks}).`
      );
    }

    // 1. Dividir a série em N blocos de tamanho aproximadamente igual
    const totalCandles = klines.length;
    const blockSize = Math.floor(totalCandles / nBlocks);
    const blocks: T[][] = [];

    for (let i = 0; i < nBlocks; i++) {
      const startIndex = i * blockSize;
      const endIndex = i === nBlocks - 1 ? totalCandles : (i + 1) * blockSize;
      blocks.push(klines.slice(startIndex, endIndex));
    }

    // 2. Gerar combinações de índices de blocos para Teste
    const testCombinations = this.generateIndexCombinations(nBlocks, kTestBlocks);

    // 3. Montar os caminhos (paths) de validação cruzada combinatorial
    const splitPaths: CombinatorialSplitPath<T>[] = testCombinations.map(
      (testIndices, splitIdx) => {
        const testBlockIndicesSet = new Set(testIndices);
        const trainBlockIndices: number[] = [];

        for (let i = 0; i < nBlocks; i++) {
          if (!testBlockIndicesSet.has(i)) {
            trainBlockIndices.push(i);
          }
        }

        const testData: T[] = [];
        const trainData: T[] = [];
        const blocksSummary: BlockSummary[] = [];

        blocks.forEach((blockCandles, blockIdx) => {
          const isTest = testBlockIndicesSet.has(blockIdx);
          const startTime = blockCandles[0]?.openTime || 0;
          const endTime = blockCandles[blockCandles.length - 1]?.closeTime || 0;

          blocksSummary.push({
            blockIndex: blockIdx,
            startTime,
            endTime,
            candleCount: blockCandles.length,
            isTest,
          });

          if (isTest) {
            testData.push(...blockCandles);
          } else {
            let validTrainBlock = blockCandles;
            if (purgeWindowCandles > 0 && testBlockIndicesSet.has(blockIdx + 1)) {
              const keepCount = Math.max(0, blockCandles.length - purgeWindowCandles);
              validTrainBlock = blockCandles.slice(0, keepCount);
            }
            trainData.push(...validTrainBlock);
          }
        });

        return {
          splitId: splitIdx + 1,
          testBlockIndices: testIndices,
          trainBlockIndices,
          trainData,
          testData,
          blocksSummary,
        };
      }
    );

    return splitPaths;
  }
}
