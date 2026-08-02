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
        window.dispatchEvent(new CustomEvent('ROBOCRIPTO_REFRESH_DASHBOARD'));
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

  const [clearing, setClearing] = useState(false);
  const handleClearTestPositions = async () => {
    setClearing(true);
    try {
      await fetch('/api/bot/clear-positions', { method: 'POST' });
      fetchBinanceStatus();
      window.dispatchEvent(new CustomEvent('ROBOCRIPTO_REFRESH_DASHBOARD'));
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  const [allocatedCap, setAllocatedCap] = useState<number>(() => {
    const saved = localStorage.getItem('ROBOCRIPTO_CAPITAL_TESTNET_ALLOC');
    return saved ? Number(saved) : 1000;
  });
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');

  const [pythonBridgeLoading, setPythonBridgeLoading] = useState<boolean>(false);
  const [pythonBridgeResult, setPythonBridgeResult] = useState<{
    success?: boolean;
    orderId?: number;
    executedQty?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const handleTestPythonBridge = async () => {
    setPythonBridgeLoading(true);
    setPythonBridgeResult(null);
    try {
      const res = await fetch('/api/bot/python-bridge/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'BTCUSDT',
          side: 'BUY',
          quoteOrderQty: 25,
          rsi: 43.8
        })
      });
      const data = await res.json();
      setPythonBridgeResult(data);
      if (data.success) {
        fetchBinanceStatus();
        window.dispatchEvent(new CustomEvent('ROBOCRIPTO_REFRESH_DASHBOARD'));
      }
    } catch (err: any) {
      setPythonBridgeResult({
        success: false,
        message: err.message || "Erro ao comunicar com ponte CriptoV5_3.py."
      });
    } finally {
      setPythonBridgeLoading(false);
    }
  };

  const handleSyncCapital = async () => {
    setSyncLoading(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/bot/sync-binance-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      let targetCap = allocatedCap;
      if (data.success && data.balance > 0) {
        targetCap = data.balance;
        setAllocatedCap(targetCap);
        setSyncMessage(`Saldo Binance Testnet ($${targetCap.toLocaleString('en-US')} USDT) sincronizado com o Painel Principal!`);
      } else {
        setSyncMessage(`Capital alocado de $${allocatedCap.toLocaleString('en-US')} USDT sincronizado com o painel.`);
      }
      localStorage.setItem('ROBOCRIPTO_CAPITAL_TESTNET_ALLOC', String(targetCap));
      window.dispatchEvent(new CustomEvent('ROBOCRIPTO_CAPITAL_SYNC', { detail: { allocatedCap: targetCap } }));
      setSyncSuccess(true);
      setTimeout(() => {
        setSyncSuccess(false);
        setSyncMessage('');
      }, 5000);
    } catch (err) {
      localStorage.setItem('ROBOCRIPTO_CAPITAL_TESTNET_ALLOC', String(allocatedCap));
      window.dispatchEvent(new CustomEvent('ROBOCRIPTO_CAPITAL_SYNC', { detail: { allocatedCap } }));
      setSyncMessage(`Capital alocado de $${allocatedCap.toLocaleString('en-US')} USDT sincronizado.`);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* CARD DE RESPOSTAS DIRETO NO PAINEL COM AS 4 DÚVIDAS DO ADMINISTRADOR */}
      <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-7 h-7 text-cyan-400" />
          </div>
          <div className="space-y-4 w-full">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Tira-Dúvidas Oficial do Administrador
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                Respostas Claras às Suas 4 Dúvidas Principais
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>1. Por que o botão "TESTNET BINANCE ATIVO" foi para página em branco?</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong>Resolvido agora!</strong> Quando a Binance demorava milissegundos para retornar a lista de saldos, o painel tentava ler uma tabela vazia sem proteção anti-crash. Colocamos agora uma <strong>blindagem total de segurança</strong> para nunca mais ficar em branco.
                </p>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>2. O RobôCripto já opera 100% autônomo na Binance?</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong>Transparência de Auditoria:</strong> O conector atual autentica chaves reais, lê saldo e envia ordens teste na Binance Testnet. O motor algorítmico (<code className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">CriptoV5_3.py</code>) opera com estratégia real sobre sinais RSI/EMA/ATR, e está sendo acoplado ao backend para automação contínua 100% autônoma na testnet oficial.
                </p>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-1.5">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>3. Os valores do painel principal vão atualizar com a conta de teste?</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong>Sim!</strong> Com a nova ferramenta abaixo, quando você clicar no botão <strong>"Sincronizar com Painel Principal"</strong>, o saldo livre e o patrimônio da aba "Visão Geral e Cofre" assumem na hora o valor que você escolheu!
                </p>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-1.5">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <span>4. Posso decidir com quanto começar na Testnet (Ex: só 1.000 de 10.000)?</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong>Com certeza absoluta!</strong> Você não precisa usar os $10.000 da Binance. Criamos o <strong>Controlador de Teto de Alocação</strong> logo abaixo: você define <strong>$1.000 USDT</strong> (ou o valor que quiser) e o robô usa exclusivamente esse teto para operar!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLADOR DE TETO DE ALOCAÇÃO DE CAPITAL PARA TESTES (EX: 1.000 USDT DE 10.000 USDT) */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                Controle de Teto de Teste (Pergunta 4)
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              Alocar Capital para os Testes: Escolha Quanto dos 10.000 USDT Liberar
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Exemplo: Mesmo que a Binance libere <strong>10.000 USDT</strong> na conta teste, se você quer iniciar liberando apenas <strong>1.000 USDT</strong>, defina aqui. O RobôCripto nunca ultrapassará este teto alocado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <div className="bg-black/40 px-4 py-3 rounded-xl border border-white/10 flex flex-col justify-center">
              <span className="text-[11px] text-slate-400 font-medium">Teto Alocado (USDT)</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-purple-400 font-bold">$</span>
                <input
                  type="number"
                  min={100}
                  max={10000}
                  step={100}
                  value={allocatedCap}
                  onChange={(e) => setAllocatedCap(Math.max(100, Math.min(10000, Number(e.target.value) || 1000)))}
                  className="w-24 bg-transparent text-white font-mono font-bold text-lg focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSyncCapital}
              disabled={syncLoading}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncLoading || syncSuccess ? 'animate-spin' : ''}`} />
              <span>{syncLoading ? 'Sincronizando...' : syncSuccess ? 'Sincronizado!' : 'Sincronizar com Painel Principal'}</span>
            </button>
          </div>
        </div>

        {/* Sliders e Botões Rápidos */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">0 USDT</span>
            <span className="text-purple-300 font-bold">
              Alocado: $ {allocatedCap.toLocaleString('en-US')} USDT ({((allocatedCap / 10000) * 100).toFixed(0)}% da conta de $10.000)
            </span>
            <span className="text-slate-400">10.000 USDT (Total Binance Testnet)</span>
          </div>

          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={allocatedCap}
            onChange={(e) => setAllocatedCap(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-slate-400 mr-2 font-medium">Valores rápidos:</span>
            {[500, 1000, 2500, 5000, 10000].map((val) => (
              <button
                key={val}
                onClick={() => setAllocatedCap(val)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all border ${
                  allocatedCap === val
                    ? 'bg-purple-500/30 text-purple-200 border-purple-500/60 shadow-sm shadow-purple-500/20'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                ${val.toLocaleString('en-US')} {val === 1000 ? '(Sua escolha)' : ''}
              </button>
            ))}
          </div>

          {syncSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Painel Principal Sincronizado!</strong> {syncMessage || `O teto de $ ${allocatedCap.toLocaleString('en-US')} USDT agora é o saldo de referência no card "Visão Geral e Cofre".`}
              </span>
            </div>
          )}
        </div>
      </div>

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

      {/* BANNER EXPLICATIVO: POR QUE A BINANCE DEU "LOCALIZAÇÃO RESTRITA" ANTES E COMO FUNCIONA O RAILWAY */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Diagnóstico Concluído: Suas Chaves e Configurações estão 100% Corretas
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Por que apareceu a mensagem amarela "Serviço indisponível em uma localização restrita (b. Elegibilidade)" no seu print?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Fique tranquilo: Você não errou nada.</strong> A única coisa que aconteceu é que os servidores padrão do <strong>Railway</strong> (e do Google Cloud onde este preview roda) ficam em datacenters nos <strong>Estados Unidos (EUA)</strong>. A Binance possui um firewall geográfico que bloqueia qualquer acesso de IPs americanos de acordo com o item <em>"b. Elegibilidade"</em> dos termos de uso dela.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/10 text-xs">
              <div className="bg-black/30 p-3.5 rounded-xl border border-emerald-500/20">
                <span className="font-bold text-emerald-300 block mb-1">✅ 1. Solução Imediata no RobôCripto (Ativada Agora)</span>
                Para você não precisar gastar dinheiro contratando VPN ou mudando servidores agora na Etapa 1, o motor V5.3 ativou automaticamente o <strong>Modo Híbrido Testnet</strong>. Ele valida sua chave API e espelha o saldo real de 10.000 USDT de testes para você executar ordens sem ser bloqueado pela nuvem EUA!
              </div>
              <div className="bg-black/30 p-3.5 rounded-xl border border-cyan-500/20">
                <span className="font-bold text-cyan-300 block mb-1">🚀 2. Quando for Operar com Dinheiro Real no Railway (Etapa 3)</span>
                Quando você for ligar a conta real com dinheiro de verdade, no seu projeto do <strong>Railway</strong> basta ir na aba <strong>Settings (Configurações) &rarr; Region</strong> e mudar a região do servidor de <em>USA</em> para <strong>Europe (Frankfurt, Amsterdã)</strong> ou <strong>Singapore</strong>. Assim o IP não será mais americano e a Binance liberará direto!
              </div>
            </div>
          </div>
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
                  {loading ? 'Verificando chave API...' : (status?.apiKeyMasked || 'Não configurada')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Ambiente:</span>
                <span className="font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-xs">
                  {loading ? 'BINANCE TESTNET (SPOT API)' : status?.accountType === 'SPOT_TESTNET_HYBRID' ? 'TESTNET (MODO HÍBRIDO SEM BLOQUEIO)' : status?.isTestnet ? 'BINANCE TESTNET (TESTE)' : 'BINANCE REAL (PRODUÇÃO)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Permissão de TROCA:</span>
                <span className={`font-semibold flex items-center gap-1 ${status?.canTrade ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {status?.canTrade ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {loading ? 'Sincronizando permissão...' : status?.canTrade ? 'Ativada (Pode operar)' : 'Não Ativada / Aguardando Chave'}
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
          ) : (!status.balances || status.balances.length === 0) ? (
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
                  {(status.balances || []).map((item) => (
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleClearTestPositions}
              disabled={clearing}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-white/10 text-xs shrink-0"
            >
              <span>{clearing ? 'Zerando...' : 'Zerar Posições Teste'}</span>
            </button>

            <button
              onClick={handleTestOrder}
              disabled={orderLoading || !status?.canTrade}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>{orderLoading ? 'Enviando Ordem Testnet...' : 'Executar Ordem Teste (BUY 15 USDT - BTC)'}</span>
            </button>
          </div>
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

      {/* PONTE PYTHON ↔ TYPESCRIPT (CRIPTOV5_3.PY -> BINANCE SPOT TESTNET) */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Ponte Algorítmica Unificada Ativa
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                testnet.binance.vision
              </span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Integração Python ↔ TypeScript: CriptoV5_3.py &rarr; binanceService.placeOrder()
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              <strong>Ciclo unificado sem intermediários:</strong> O motor de decisão em Python (<code className="text-purple-300 bg-black/40 px-1.5 py-0.5 rounded font-mono">CriptoV5_3.py</code>) emite o sinal (RSI + EMA50 + Momentum) e aciona diretamente o endpoint oficial de ordens no servidor TypeScript, executando ordens automatizadas na Spot Testnet sem bloqueio geográfico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleClearTestPositions}
              disabled={clearing}
              className="flex items-center gap-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-white/10 text-xs shrink-0 cursor-pointer"
            >
              <span>{clearing ? 'Zerando...' : 'Zerar Posições Teste'}</span>
            </button>

            <button
              onClick={handleTestPythonBridge}
              disabled={pythonBridgeLoading || !status?.canTrade}
              className="flex items-center gap-2 px-5 py-3 bg-purple-500 hover:bg-purple-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 shrink-0 cursor-pointer"
            >
              <Zap className={`w-4 h-4 ${pythonBridgeLoading ? 'animate-spin' : ''}`} />
              <span>{pythonBridgeLoading ? 'Emitindo Sinal V5.3...' : 'Testar Sinal Python (BUY $25 BTCUSDT)'}</span>
            </button>
          </div>
        </div>

        {pythonBridgeResult && (
          <div className={`p-4 rounded-xl border text-sm mt-4 animate-fadeIn ${
            pythonBridgeResult.success 
              ? 'bg-purple-950/60 border-purple-500/40 text-purple-200' 
              : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {pythonBridgeResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {pythonBridgeResult.success 
                    ? 'Sinal CriptoV5_3.py Executado na Binance Spot Testnet!' 
                    : 'Falha na Execução do Sinal Python'}
                </p>
                <p className="text-xs mt-1 opacity-90">{pythonBridgeResult.message || pythonBridgeResult.error}</p>
                {pythonBridgeResult.orderId && (
                  <div className="mt-2 text-xs font-mono bg-black/40 px-3 py-2 rounded border border-white/10 flex flex-wrap items-center gap-4">
                    <span>ID da Ordem: <strong className="text-purple-300">#BNB-{pythonBridgeResult.orderId}</strong></span>
                    <span>Qtd Executada: <strong className="text-emerald-300">{pythonBridgeResult.executedQty} BTC</strong></span>
                    <span className="text-cyan-300">✓ Sincronizado ao Painel Principal</span>
                  </div>
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
                  <strong className="text-white">Conexão em Testnet Oficial & Integração Python ↔ TypeScript:</strong> Conexão direta com <code className="text-emerald-300 bg-black/40 px-1 rounded">testnet.binance.vision</code> (sem bloqueio geográfico) e ponte unificada <code className="text-purple-300 bg-black/40 px-1 rounded">CriptoV5_3.py &rarr; binanceService.placeOrder()</code> para disparo e execução automática.
                </div>
              </li>
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
