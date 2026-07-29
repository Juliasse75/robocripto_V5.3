# RobôCripto V5.3 - Fogo Livre Blindado 🚀

Painel Institucional e Backend de Monitoramento Quantitativo em Criptomoedas com Gestão de Risco do Cofre, Trailing Stop e Integração Supabase / Railway.

## 📋 Recursos Principais

- **Gestão de Capital Inteligente**:
  - Capital Base ($1.000)
  - Tiro Dinâmico de 5% por operação (mínimo $50)
  - **Cofre Blindado (100% Protegido)**: Lucro travado que nunca é exposto a risco
  - **Gatilho de Proteção +40%**: Congela o tiro na base inicial do dia ao atingir +40% de lucro no caixa
- **Estratégias de Entrada e Saída**:
  - Indicadores: RSI (45 - 70), EMA 50, Momentum
  - Trailing Stop Dinâmico (Surf 0.7% / 0.6%)
  - Resgate do Grid (Lucro +0.4%)
- **Auditoria de 24 Horas**:
  - Histórico detalhado de operações com exportação em CSV
  - Monitor de Win Rate, Fator de Lucro e Taxas Taker
- **Radar de Mercado**:
  - Escaneamento em tempo real das 30 moedas principais (Majors e Altcoins)
- **Painel de Controle e Guia Supabase / Railway**:
  - Scripts SQL e Python prontos para conectar o robô no Railway com Supabase PostgreSQL

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Recharts, Motion
- **Build Tool**: Vite
- **Servidor API**: Express + TypeScript

## 🚀 Como Executar Localmente

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
