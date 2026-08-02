import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Layers } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    // Limpa eventuais valores NaN em cache no localStorage que pudessem causar falha de renderização
    localStorage.removeItem('ROBOCRIPTO_CAPITAL_TESTNET_ALLOC');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-xl">
            <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Painel de Proteção Ativado</h1>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Ocorreu uma inconsistência temporária nos dados do painel. A segurança do sistema preveniu a tela em branco e está pronto para restaurar o estado limpo do RobôCripto V5.3.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Restaurar Painel & Limpar Cache
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
