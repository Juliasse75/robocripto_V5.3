import crypto from "crypto";

export interface BinanceAccountBalance {
  asset: string;
  free: string;
  locked: string;
  totalUSDT?: number;
}

export interface BinanceConnectionStatus {
  isConnected: boolean;
  isTestnet: boolean;
  hasKeys: boolean;
  apiKeyMasked: string;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  accountType: string;
  updateTime: string;
  balances: BinanceAccountBalance[];
  totalWalletBalanceUSDT: number;
  message?: string;
  error?: string;
}

export interface BinanceOrderParams {
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT";
  quantity?: number;
  quoteOrderQty?: number; // Para ordens MARKET BUY em USDT
  price?: number;
}

export class BinanceService {
  private getBaseUrl(): string {
    const isTestnet = process.env.BINANCE_TESTNET === "true" || process.env.BINANCE_TESTNET === "1" || !process.env.BINANCE_TESTNET;
    return isTestnet
      ? "https://testnet.binance.vision"
      : "https://api.binance.com";
  }

  public isTestnetMode(): boolean {
    const val = process.env.BINANCE_TESTNET;
    return val === "true" || val === "1" || !val; // Default true para segurança
  }

  private getApiKey(): string {
    return (process.env.BINANCE_API_KEY || "").trim();
  }

  private getApiSecret(): string {
    return (process.env.BINANCE_API_SECRET || "").trim();
  }

  public hasCredentials(): boolean {
    return Boolean(this.getApiKey() && this.getApiSecret());
  }

  public getMaskedApiKey(): string {
    const key = this.getApiKey();
    if (!key) return "Não configurada";
    if (key.length <= 8) return "********";
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  private signQueryString(queryString: string): string {
    const secret = this.getApiSecret();
    return crypto
      .createHmac("sha256", secret)
      .update(queryString)
      .digest("hex");
  }

  public async getTickerPrice(symbol: string = "BTCUSDT"): Promise<number> {
    try {
      const url = `${this.getBaseUrl()}/api/v3/ticker/price?symbol=${symbol}`;
      const response = await fetch(url);
      if (!response.ok) return 0;
      const data = await response.json();
      return parseFloat(data.price || "0");
    } catch (error) {
      return 0;
    }
  }

  public async getMultiplePrices(symbols: string[]): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    try {
      const url = `${this.getBaseUrl()}/api/v3/ticker/price`;
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!response.ok) return result;
      const data: Array<{ symbol: string; price: string }> = await response.json();
      for (const item of data) {
        if (symbols.includes(item.symbol)) {
          result[item.symbol] = parseFloat(item.price);
        }
      }
    } catch (error) {
      console.error("Erro ao obter preços Binance:", error);
    }
    return result;
  }

  public async getAccountStatus(): Promise<BinanceConnectionStatus> {
    const isTestnet = this.isTestnetMode();
    const hasKeys = this.hasCredentials();
    const apiKeyMasked = this.getMaskedApiKey();

    if (!hasKeys) {
      return {
        isConnected: false,
        isTestnet,
        hasKeys: false,
        apiKeyMasked: "Nenhuma chave",
        canTrade: false,
        canWithdraw: false,
        canDeposit: false,
        accountType: "N/A",
        updateTime: new Date().toLocaleTimeString("pt-BR"),
        balances: [],
        totalWalletBalanceUSDT: 0,
        message: "Chaves BINANCE_API_KEY e BINANCE_API_SECRET não configuradas no servidor."
      };
    }

    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}&recvWindow=10000`;
      const signature = this.signQueryString(queryString);
      const url = `${this.getBaseUrl()}/api/v3/account?${queryString}&signature=${signature}`;

      const response = await fetch(url, {
        headers: {
          "X-MBX-APIKEY": this.getApiKey()
        },
        signal: AbortSignal.timeout(6000)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMsg = `Erro HTTP ${response.status}`;
        try {
          const jsonErr = JSON.parse(errorBody);
          if (jsonErr.msg) errorMsg = jsonErr.msg;
        } catch {
          // ignore
        }

        // Exibição honesta do erro real da Binance (sem fallback de saldo fictício)

        return {
          isConnected: false,
          isTestnet,
          hasKeys: true,
          apiKeyMasked,
          canTrade: false,
          canWithdraw: false,
          canDeposit: false,
          accountType: "ERRO",
          updateTime: new Date().toLocaleTimeString("pt-BR"),
          balances: [],
          totalWalletBalanceUSDT: 0,
          error: errorMsg,
          message: `Falha na conexão com a Binance: ${errorMsg}`
        };
      }

      const data = await response.json();

      // Filtrar apenas saldos maiores que 0
      const prices = await this.getMultiplePrices(["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT"]);
      let totalUSDT = 0;

      const nonZeroBalances: BinanceAccountBalance[] = (data.balances || [])
        .map((item: { asset: string; free: string; locked: string }) => {
          const freeVal = parseFloat(item.free);
          const lockedVal = parseFloat(item.locked);
          const totalAsset = freeVal + lockedVal;

          let estimatedUSDT = 0;
          if (item.asset === "USDT" || item.asset === "BUSD" || item.asset === "FDUSD" || item.asset === "USDC") {
            estimatedUSDT = totalAsset;
          } else if (prices[`${item.asset}USDT`]) {
            estimatedUSDT = totalAsset * prices[`${item.asset}USDT`];
          }

          totalUSDT += estimatedUSDT;

          return {
            asset: item.asset,
            free: item.free,
            locked: item.locked,
            totalUSDT: parseFloat(estimatedUSDT.toFixed(2))
          };
        })
        .filter((item: BinanceAccountBalance) => {
          const freeVal = parseFloat(item.free);
          const lockedVal = parseFloat(item.locked);
          return (freeVal > 0 || lockedVal > 0) && (item.totalUSDT || 0) > 0.01;
        })
        .sort((a: BinanceAccountBalance, b: BinanceAccountBalance) => (b.totalUSDT || 0) - (a.totalUSDT || 0));

      return {
        isConnected: true,
        isTestnet,
        hasKeys: true,
        apiKeyMasked,
        canTrade: Boolean(data.canTrade),
        canWithdraw: Boolean(data.canWithdraw),
        canDeposit: Boolean(data.canDeposit),
        accountType: data.accountType || "SPOT",
        updateTime: new Date().toLocaleTimeString("pt-BR"),
        balances: nonZeroBalances,
        totalWalletBalanceUSDT: parseFloat(totalUSDT.toFixed(2)),
        message: `Conectado com sucesso na Binance ${isTestnet ? "Spot Testnet" : "Produção (Real)"}!`
      };
    } catch (err: any) {
      return {
        isConnected: false,
        isTestnet,
        hasKeys: true,
        apiKeyMasked,
        canTrade: false,
        canWithdraw: false,
        canDeposit: false,
        accountType: "ERRO",
        updateTime: new Date().toLocaleTimeString("pt-BR"),
        balances: [],
        totalWalletBalanceUSDT: 0,
        error: err.message || "Erro desconhecido",
        message: `Falha de rede ao conectar à Binance: ${err.message}`
      };
    }
  }

  public async placeOrder(params: BinanceOrderParams): Promise<{
    success: boolean;
    orderId?: number;
    executedQty?: string;
    cummulativeQuoteQty?: string;
    error?: string;
    message: string;
  }> {
    if (!this.hasCredentials()) {
      return {
        success: false,
        message: "Chaves de API da Binance não estão configuradas."
      };
    }

    try {
      const timestamp = Date.now();
      let queryParams = `symbol=${params.symbol}&side=${params.side}&type=${params.type}&timestamp=${timestamp}&recvWindow=10000`;

      if (params.type === "MARKET") {
        if (params.side === "BUY" && params.quoteOrderQty) {
          queryParams += `&quoteOrderQty=${params.quoteOrderQty.toFixed(2)}`;
        } else if (params.quantity) {
          queryParams += `&quantity=${params.quantity}`;
        }
      } else if (params.type === "LIMIT") {
        if (!params.price || !params.quantity) {
          return { success: false, message: "Preço e quantidade são obrigatórios para ordens LIMIT." };
        }
        queryParams += `&timeInForce=GTC&quantity=${params.quantity}&price=${params.price}`;
      }

      const signature = this.signQueryString(queryParams);
      const url = `${this.getBaseUrl()}/api/v3/order?${queryParams}&signature=${signature}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": this.getApiKey()
        },
        signal: AbortSignal.timeout(6000)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.msg || "Erro na execução da ordem",
          message: `Erro da Binance (${data.code || response.status}): ${data.msg || "Falha na requisição"}`
        };
      }

      return {
        success: true,
        orderId: data.orderId,
        executedQty: data.executedQty,
        cummulativeQuoteQty: data.cummulativeQuoteQty,
        message: `Ordem ${params.side} ${params.symbol} executada com sucesso na ${this.isTestnetMode() ? "Testnet" : "Binance Real"}! ID: #BNB-${data.orderId}`
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        message: `Falha na requisição de ordem: ${err.message}`
      };
    }
  }
}

export const binanceService = new BinanceService();
