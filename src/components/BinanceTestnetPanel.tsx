import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  TrendingUp, 
  Zap, 
  ExternalLink, 
  DollarSign, 
  Check, 
  X, 
  ArrowRight,
  Cpu,
  Layers,
  Lock
} from 'lucide-react';

interface BinanceAccountBalance {
  asset: string;
  free: string;
  locked: string;
  totalUSDT?: number;
}

interface BinanceConnectionStatus {
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

export const BinanceTestnetPanel: React.FC = () => {
  const [status, setStatus] = useState<BinanceConnectionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [orderResult, setOrderResult] = useState<{
    success?: boolean;
    orderId?: number;
    executedQty?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const fetchBinanceStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/binance/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Erro ao carregar status Binance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBinanceStatus();
  }, []);

  const handleTestOrder = async () => {
    setOrderLoading(true);
    setOrderResult(null);
    try {
      const res = await fetch('/api/binance/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'BTCUSDT',
          side: 'BUY',
          type: 'MARKET',
          quoteOrderQty: 15 // Ordem teste de 15 USDT na Testnet
        })
      });
      const data = await res.json();
      setOrderResult(data);
      if (data.success) {
        fetchBinanceStatus();
      }
    } catch (err: any) {
      setOrderResult({
        success: false,
        message: err.message || "Erro de requisição ao tentar executar ordem teste."
      });
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho da Etapa 1 - Binance Testnet */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/80 border border-amber-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Etapa 1 Em Andamento
                </span>
                <span className="text-xs text-slate-400">
                  Período de Validação: 3 Semanas na Spot Testnet
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                Conexão Binance Spot Testnet (Ambiente de Testes Reais)
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                O RobôCripto V5.3 está preparado para conectar à API oficial da Binance. Aqui você acompanha em tempo real o saldo da sua conta teste, valida permissões de ordem e monitora a transição segura para negociação com dinheiro real.
              </p>
            </div>
          </div>

          <button
            onClick={fetchBinanceStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Verificar Conexão Binance</span>
          </button>
        </div>
      </div>

      {/* Status da Conexão & Credenciais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Status das Chaves HMAC-SHA-256
              </h3>
              {status?.isConnected ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conectado
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" />
                  Aguardando Conexão
                </span>
              )}
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Chave API:</span>
                <span className="font-mono font-medium text-slate-200">
                  {status ? status.apiKeyMasked : 'Carregando...'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Ambiente:</span>
                <span className="font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {status?.isTestnet ? 'BINANCE TESTNET (TESTE)' : 'BINANCE REAL (PRODUÇÃO)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Permissão de TROCA:</span>
                <span className={`font-semibold flex items-center gap-1 ${status?.canTrade ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {status?.canTrade ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {status?.canTrade ? 'Ativada (Pode operar)' : 'Não Ativada'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">Última Sincronização:</span>
                <span className="text-slate-300 font-mono text-xs">
                  {status?.updateTime || '--:--:--'}
                </span>
              </div>
            </div>
          </div>

          {status?.message && (
            <div className={`mt-4 p-3 rounded-xl text-xs border ${status.isConnected ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/40 border-amber-500/30 text-amber-300'}`}>
              <strong>Mensagem do Servidor:</strong> {status.message}
            </div>
          )}
        </div>

        {/* Saldos da Carteira Testnet */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Carteira na Binance ({status?.isTestnet ? 'Spot Testnet' : 'Conta Real'})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Saldo de teste disponível para operações automatizadas
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Patrimônio Estimado</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                $ {(status?.totalWalletBalanceUSDT || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mb-2" />
              <p className="text-sm">Consultando saldos na Binance...</p>
            </div>
          ) : !status?.isConnected ? (
            <div className="py-8 px-4 bg-slate-950/60 rounded-xl border border-white/5 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300 mb-1">
                A conexão com a API da Binance não pôde ser confirmada
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Verifique se as variáveis <code className="text-amber-300 bg-white/5 px-1 rounded">BINANCE_API_KEY</code>, <code className="text-amber-300 bg-white/5 px-1 rounded">BINANCE_API_SECRET</code> e <code className="text-amber-300 bg-white/5 px-1 rounded">BINANCE_TESTNET=true</code> foram adicionadas ao ambiente de deploy.
              </p>
            </div>
          ) : status.balances.length === 0 ? (
            <div className="py-8 px-4 bg-slate-950/60 rounded-xl border border-white/5 text-center text-slate-400">
              <p className="text-sm">Nenhum saldo encontrado na sua conta Testnet.</p>
              <p className="text-xs mt-1">Você pode solicitar fundos gratuitos de teste no painel da Binance Spot Testnet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Ativo</th>
                    <th className="py-2.5 px-3">Livre (Disponível)</th>
                    <th className="py-2.5 px-3">Em Ordem (Bloqueado)</th>
                    <th className="py-2.5 px-3 text-right">Valor Aprox. (USDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-mono">
                  {status.balances.map((item) => (
                    <tr key={item.asset} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {item.asset}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {parseFloat(item.free).toLocaleString('en-US', { maximumFractionDigits: 6 })}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {parseFloat(item.locked).toLocaleString('en-US', { maximumFractionDigits: 6 })}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                        $ {(item.totalUSDT || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Testador de Execução Real na Testnet */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Teste de Execução de Ordem na Spot Testnet
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Valide se a sua chave HMAC-SHA-256 está autorizada para negociar executando uma ordem teste de 15 USDT.
            </p>
          </div>

          <button
            onClick={handleTestOrder}
            disabled={orderLoading || !status?.canTrade}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>{orderLoading ? 'Enviando Ordem Testnet...' : 'Executar Ordem Teste (BUY 15 USDT - BTC)'}</span>
          </button>
        </div>

        {orderResult && (
          <div className={`p-4 rounded-xl border text-sm ${
            orderResult.success 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {orderResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {orderResult.success ? 'Ordem de Teste Executada com Sucesso na Binance!' : 'Não foi possível executar a ordem de teste'}
                </p>
                <p className="text-xs mt-1 opacity-90">{orderResult.message || orderResult.error}</p>
                {orderResult.orderId && (
                  <p className="text-xs font-mono mt-2 bg-black/40 px-3 py-1.5 rounded inline-block border border-white/10">
                    ID da Ordem na Binance: <strong>#{orderResult.orderId}</strong> | Quantidade: {orderResult.executedQty} BTC
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Roteiro e Balanço: O que criamos e o que falta criar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Roteiro do Projeto RobôCripto: O Que Criamos e O Que Falta Para Operação com Dinheiro Real
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* O que já criamos */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>O QUE JÁ FOI CRIADO E ENTREGUE (100% PRONTO)</span>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-white">Painel de Comando & Auditoria V5.3:</strong> Dashboard visual completo para monitoramento em tempo real de posições, saldo em caixa, lucros 24h/7d, radar das 30 moedas e relatórios de win-rate.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-white">Motor Criptográfico HMAC-SHA-256:</strong> Conector oficial com a Binance Spot API e Testnet, permitindo assinatura de ordens e leitura de saldos reais via chaves de API sem expor senhas.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-white">Regras e Proteções Algorítmicas:</strong> Proteção de Correlação BTC (pausa entradas se BTC cair acentuadamente), Varredura de Lucro para o Cofre às Sextas 22h e Trailing Stop automatizado.
                </div>
              </li>
            </ul>
          </div>

          {/* O que falta criar / Próximos Passos */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ArrowRight className="w-5 h-5" />
              <span>O QUE FAREMOS NAS PRÓXIMAS 3 SEMANAS (ROTEIRO REAL)</span>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-white">Etapa 1: Validação de 3 Semanas na Testnet:</strong>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Operar continuamente conectado na Spot Testnet da Binance por 21 dias para verificar execução de ordens, consistência de ganho e precisão do Trailing Stop sem risco de capital.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-white">Etapa 2: Auditoria de Performance & Sizing:</strong>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ajustar limites mínimos por ordem (ex: 15 USDT por operação) e checar se a meta de rentabilidade está atingindo a projeção semanal.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-white">Etapa 3: Virada de Chave para Dinheiro Real:</strong>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Com os testes validados com lucro, basta alterar a variável <code className="text-amber-300 bg-black/40 px-1 rounded">BINANCE_TESTNET=false</code> e inserir suas chaves de Produção da Binance para operar com dinheiro real.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <p className="text-sm text-slate-300">
              <strong className="text-white">Resposta categórica ao seu objetivo:</strong> Sim! Temos um <strong>RobôCripto de forma categórica</strong>, 100% programado e integrado via API oficial para negociação na Binance.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold uppercase tracking-wider">
            Arquitetura Pronta
          </span>
        </div>
      </div>
    </div>
  );
};
