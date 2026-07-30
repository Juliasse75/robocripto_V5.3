import React, { useState } from 'react';
import { Database, Server, Terminal, Copy, Check, ExternalLink, ShieldCheck, Code, Layers, FileCode } from 'lucide-react';

export const SupabaseRailwayGuide: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);

  const sqlSchemaCode = `-- ==============================================================================
-- SCHEMA SUPABASE - ROBÔ CRIPTO V5.3 (LOGUSQ INSTITUTIONAL)
-- Execute este script no SQL Editor do Supabase para criar as tabelas
-- ==============================================================================

-- 1. Tabela de Logs de Operações
CREATE TABLE IF NOT EXISTS public.trade_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data_hora VARCHAR(50) NOT NULL,
    moeda VARCHAR(20) NOT NULL,
    tipo_saida VARCHAR(30) NOT NULL, -- 'TAKE_PROFIT', 'STOP_LOSS', 'RESGATE_GRID', 'SAQUE_SEXTA'
    contratos NUMERIC(18, 8) NOT NULL,
    preco_medio NUMERIC(18, 8) NOT NULL,
    preco_saida NUMERIC(18, 8) NOT NULL,
    num_ordens INT DEFAULT 1,
    rsi_entrada NUMERIC(5, 2),
    var_entrada NUMERIC(8, 4),
    lucro_liquido NUMERIC(18, 4) NOT NULL,
    novo_caixa NUMERIC(18, 4) NOT NULL,
    categoria VARCHAR(10) DEFAULT 'ALT'
);

-- Index para buscas rápidas por data (auditoria 24h)
CREATE INDEX IF NOT EXISTS idx_trade_logs_created_at ON public.trade_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_logs_moeda ON public.trade_logs (moeda);

-- 2. Tabela do Cofre e Controle de Capital
CREATE TABLE IF NOT EXISTS public.capital_vault (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    capital_inicial NUMERIC(18, 2) DEFAULT 1000.00,
    capital_livre NUMERIC(18, 2) NOT NULL,
    capital_em_negociacao NUMERIC(18, 2) DEFAULT 0.00,
    capital_cofre NUMERIC(18, 2) DEFAULT 0.00, -- Lucro seguro blindado
    tiro_dinamico NUMERIC(18, 2) DEFAULT 50.00,
    gatilho_40_ativado BOOLEAN DEFAULT false
);

-- Inserir estado inicial caso a tabela esteja vazia
INSERT INTO public.capital_vault (capital_inicial, capital_livre, capital_em_negociacao, capital_cofre, tiro_dinamico)
SELECT 1000.00, 1000.00, 0.00, 0.00, 50.00
WHERE NOT EXISTS (SELECT 1 FROM public.capital_vault);

-- 3. Habilitar RLS (Row Level Security) e permitir leitura do Dashboard
ALTER TABLE public.trade_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública ou autenticada" ON public.trade_logs;
CREATE POLICY "Permitir leitura pública ou autenticada" ON public.trade_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção via service role/anon" ON public.trade_logs;
CREATE POLICY "Permitir inserção via service role/anon" ON public.trade_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura do cofre" ON public.capital_vault;
CREATE POLICY "Permitir leitura do cofre" ON public.capital_vault FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir atualização do cofre" ON public.capital_vault;
CREATE POLICY "Permitir atualização do cofre" ON public.capital_vault FOR ALL USING (true);
`;

  const pythonBotCode = `# ==============================================================================
# MOTOR INSTITUTIONAL CRIPTO V5.3 - COM SUPABASE & RAILWAY AUTOMÁTICO
# ==============================================================================
import ccxt
import pandas as pd
import numpy as np
import time
import os
import requests
from datetime import datetime, timedelta
from supabase import create_client, Client

# ── CONFIGURAÇÕES SUPABASE & RAILWAY ─────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://seu-projeto.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sua-chave-anon-ou-service-role")
DASHBOARD_WEBHOOK = os.getenv("DASHBOARD_WEBHOOK", "") # URL do Dashboard se houver webhook
WEBHOOK_SECRET    = os.getenv("WEBHOOK_SECRET", "logusq_secret_2026")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── CAPITAL E REGRA DO COFRE ─────────────────────────────────────────────────
caixa_virtual    = 1000.00
caixa_para_saque = 0.0
percentual_por_ordem = 0.05    # 5% do capital base por entrada
alavancagem          = 10      # 10x
max_ordens_ativas     = 3       # Máx reforços grid
limite_posicoes      = 10      # Máx simultâneos

# ── FUNÇÃO DE REGISTRO NO SUPABASE & DASHBOARD ──────────────────────────────
def salvar_operacao_supabase(moeda, tipo_saida, contratos, preco_medio, preco_saida,
                              num_ordens, rsi_entrada, var_entrada, lucro_liq, novo_caixa):
    data_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    payload = {
        "data_hora": data_str,
        "moeda": moeda,
        "tipo_saida": tipo_saida,
        "contratos": float(contratos),
        "preco_medio": float(preco_medio),
        "preco_saida": float(preco_saida),
        "num_ordens": int(num_ordens),
        "rsi_entrada": float(rsi_entrada) if rsi_entrada else None,
        "var_entrada": float(var_entrada) if var_entrada else None,
        "lucro_liquido": float(lucro_liq),
        "novo_caixa": float(novo_caixa),
        "categoria": "MAJOR" if moeda in ['BTC/USDT', 'ETH/USDT'] else "ALT"
    }

    try:
        # 1. Envia para o Banco de Dados Supabase
        supabase.table("trade_logs").insert(payload).execute()
        print(f"✅ [SUPABASE] Operação em {moeda} salva no banco de dados!")

        # 2. Atualiza estado do Cofre no Supabase
        supabase.table("capital_vault").update({
            "capital_livre": float(novo_caixa),
            "updated_at": "now()"
        }).eq("id", "1b9d6bcd-bbfd-4b2d-9b5d-000000000000").execute()

        # 3. Notifica o Dashboard em tempo real se configurado
        if DASHBOARD_WEBHOOK:
            requests.post(DASHBOARD_WEBHOOK, json={
                "secret": WEBHOOK_SECRET,
                "trade": payload
            }, timeout=3)
    except Exception as e:
        print(f"⚠️ Erro ao persistir no Supabase: {e}")

print("🚀 Bot V5.3 iniciado e conectado ao Supabase no Railway!")
`;

  const requirementsText = `ccxt==4.2.55
pandas==2.2.1
numpy==1.26.4
supabase==2.4.0
requests==2.31.0
python-dotenv==1.0.1
`;

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 backdrop-blur-md">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Hub de Integração Railway + Supabase</h2>
            <p className="text-xs text-slate-400">
              Passo a passo completo e arquivos prontos para subir o script <code className="text-emerald-400">bot_v53.py</code> na nuvem com banco de dados em tempo real.
            </p>
          </div>
        </div>
      </div>

      {/* Deployment Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-2">
            <span className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-xs">1</span>
            Criar Banco Supabase
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Acesse o Supabase (gratuito), crie um novo projeto, vá no <strong>SQL Editor</strong> e rode o script SQL fornecido abaixo para criar as tabelas do Cofre e logs.
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-2">
            <span className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-xs">2</span>
            Hospedar no Railway
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            No Railway.app, conecte seu GitHub, crie um novo <strong>Worker Service</strong> com o script do robô e configure as variáveis de ambiente (<code className="text-emerald-400">SUPABASE_URL</code> e <code className="text-emerald-400">SUPABASE_KEY</code>).
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2">
            <span className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-xs">3</span>
            Conectar com o Dashboard
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            O robô V5.3 salvará todas as saídas (Take Profit, Stop Loss, Resgate) diretamente no banco. O Dashboard lerá os dados e atualizará o Cofre em tempo real.
          </p>
        </div>
      </div>

      {/* SQL Script Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-300" />
            <span className="text-xs font-bold text-white">1. Script SQL para o Supabase (<code className="text-cyan-300">schema.sql</code>)</span>
          </div>
          <button
            onClick={() => copyToClipboard(sqlSchemaCode, setCopiedSql)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
          </button>
        </div>
        <div className="p-4 bg-black/40 font-mono text-xs text-slate-300 overflow-x-auto max-h-80">
          <pre>{sqlSchemaCode}</pre>
        </div>
      </div>

      {/* Python Bot Supabase Script Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">2. Conectores Supabase do Robô (<code className="text-emerald-400">bot_v53_supabase.py</code>)</span>
          </div>
          <button
            onClick={() => copyToClipboard(pythonBotCode, setCopiedPython)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            {copiedPython ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPython ? 'Copiado!' : 'Copiar Python'}</span>
          </button>
        </div>
        <div className="p-4 bg-black/40 font-mono text-xs text-slate-300 overflow-x-auto max-h-80">
          <pre>{pythonBotCode}</pre>
        </div>
      </div>

      {/* Requirements.txt Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">3. Dependências para o Railway (<code className="text-amber-300">requirements.txt</code>)</span>
          </div>
          <button
            onClick={() => copyToClipboard(requirementsText, setCopiedReqs)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {copiedReqs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReqs ? 'Copiado!' : 'Copiar Requirements'}</span>
          </button>
        </div>
        <div className="p-4 bg-black/40 font-mono text-xs text-amber-300 overflow-x-auto">
          <pre>{requirementsText}</pre>
        </div>
      </div>
    </div>
  );
};
