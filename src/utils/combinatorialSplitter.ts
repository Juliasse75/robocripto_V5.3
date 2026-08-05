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
  /** Duração máxima de uma operação em milissegundos (ex: 4h = 4 * 60 * 60 * 1000 ms) */
  maxTradeDurationMs?: number;
  /** Opcional: janela de eliminação (purge) em número de candles */
  purgeWindowCandles?: number;
}

export type TestBlockTimeInput = number | { startTime: number; endTime?: number };

/**
 * Função assíncrona otimizada para expurgar (purger) amostras do conjunto de treino que
 * possam sobrepor o período de vigência dos blocos de teste.
 * 
 * Evita o contágio temporal (data leakage) liberando periodicamente o Event Loop do Node.js.
 *
 * @param trainData Array de amostras ou velas de treino
 * @param testBlocksTime Array com os timestamps de início ou intervalos dos blocos de teste
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
   * Divide uma série temporal em N blocos e gera os caminhos C(N, k) com Purging automático.
   */
  public static async splitWithPurging<T extends KlineCandle>(
    klines: T[],
    config: SplitterConfig
  ): Promise<CombinatorialSplitPath<T>[]> {
    const rawSplits = this.split(klines, config);
    if (!config.maxTradeDurationMs) return rawSplits;

    const purgedSplits: CombinatorialSplitPath<T>[] = [];

    for (const splitPath of rawSplits) {
      const testBlocksTime = splitPath.blocksSummary
        .filter((b) => b.isTest)
        .map((b) => ({ startTime: b.startTime, endTime: b.endTime }));

      const purgedTrainData = await this.purgeTrainingData(
        splitPath.trainData,
        testBlocksTime,
        config.maxTradeDurationMs
      );

      purgedSplits.push({
        ...splitPath,
        trainData: purgedTrainData,
      });
    }

    return purgedSplits;
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
