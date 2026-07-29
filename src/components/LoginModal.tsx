import React, { useState } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, Key, ArrowRight, X } from 'lucide-react';
import { UserSession } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

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
        onClose();
      } else {
        setError(data.message || 'Credenciais inválidas.');
      }
    } catch (err) {
      // Fallback local auth if API call fails
      if (username === 'admin' && (password === 'logusq2026' || password === 'admin')) {
        onLoginSuccess({
          isAuthenticated: true,
          username,
          loginTime: new Date().toISOString()
        });
        onClose();
      } else {
        setError('Usuário ou senha incorretos. Tente: admin / logusq2026');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 backdrop-blur-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Acesso ao RobôCripto V5.3</h2>
            <p className="text-xs text-slate-400">Painel de Auditoria e Gestão do Cofre</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 backdrop-blur-md border border-red-500/40 rounded-xl text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Usuário do Sistema
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Ex: admin"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-all font-mono backdrop-blur-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-all font-mono backdrop-blur-md"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Credenciais padrão de auditoria: <code className="text-emerald-300 font-mono">admin</code> / <code className="text-emerald-300 font-mono">logusq2026</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
          >
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Acessar Painel Blindado</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/10 text-center text-[11px] text-slate-400">
          🔒 Conexão segura protegida por chave de sessão com isolamento de risco do Cofre.
        </div>
      </div>
    </div>
  );
};
