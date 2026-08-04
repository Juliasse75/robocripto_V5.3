import React, { useState } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, Key, ArrowRight, Eye, EyeOff, Cpu, Shield, Activity, Zap } from 'lucide-react';
import { UserSession } from '../types';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Credenciais inválidas.');
      }
    } catch (err) {
      // Fallback local auth if API call fails or offline
      if (username === 'admin' && (password === 'logusq2026' || password === 'admin')) {
        onLoginSuccess({
          isAuthenticated: true,
          username,
          loginTime: new Date().toISOString()
        });
      } else {
        setError('Usuário ou senha incorretos. Tente: admin / logusq2026');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Glowing Mesh Gradients */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center backdrop-blur-sm">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              RobôCripto <span className="text-emerald-400 font-mono text-sm">V5.3</span>
            </h1>
            <p className="text-xs text-slate-400">Sistema Autônomo de Arbitragem & Scalping</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Servidor Seguro On-line
          </span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          
          {/* Main Card */}
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Top Decorative Glow Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
            
            {/* Card Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mx-auto mb-4 shadow-inner backdrop-blur-md">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Autenticação do Sistema</h2>
              <p className="text-xs text-slate-400 mt-1">
                Insira usuário e senha para acessar o painel de gestão do robô
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-950/80 backdrop-blur-md border border-red-500/40 rounded-2xl text-xs text-red-200 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-300">Falha na Autenticação</p>
                  <p className="text-slate-300 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Usuário do Sistema
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="admin"
                    className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-500/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-mono backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-500/80 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-mono backdrop-blur-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Credentials Tip */}
                <div className="mt-2.5 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Credenciais padrão:</span>
                  <div className="font-mono text-xs text-emerald-300 font-bold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    admin <span className="text-slate-500">/</span> logusq2026
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 text-base active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Autenticando...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Acessar Painel Blindado</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badges */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-3 text-center text-[11px] text-slate-400">
              <div className="flex items-center justify-center gap-1.5 p-2 bg-white/5 rounded-xl border border-white/5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cofre Protegido</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 bg-white/5 rounded-xl border border-white/5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Binance Testnet Direct</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500">
        © 2026 Logusq Institutional • RobôCripto V5.3 Fogo Livre Blindado
      </footer>
    </div>
  );
};
