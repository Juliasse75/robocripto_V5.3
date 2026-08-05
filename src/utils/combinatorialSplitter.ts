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
  /** Opcional: janela de eliminação (purge) em candles para evitar vazamento de dados entre treino/teste */
  purgeWindowCandles?: number;
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
   * Divide uma série temporal de velas (klines) em N blocos contínuos e gera os caminhos de Treino/Teste
   * baseados em todas as combinações C(N, k).
   *
   * @param klines Array ordenado cronologicamente de velas/k-lines
   * @param config Configuração contendo nBlocks e kTestBlocks
   * @returns Array de caminhos de treino e teste fortemente tipados
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
      // O último bloco absorve os candles remanescentes para garantir 100% de cobertura
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
            // Se houver purgeWindow, removemos os últimos candles do bloco de treino se o bloco seguinte for teste
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
