import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  User,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { BounceFinLogo } from './BounceFinLogo';

export const AuthView: React.FC = () => {
  const { login, register, loginWithBiometrics, isBiometricsAvailable } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register(name, email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Erro ao criar conta.');
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Credenciais inválidas.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setErrorMsg('');
    try {
      const res = await loginWithBiometrics();
      if (!res.success) {
        setErrorMsg(res.error || 'Autenticação biométrica falhou.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro na verificação biométrica.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background architectural gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* Brand Logo */}
        <div className="flex justify-center mb-3">
          <BounceFinLogo size="xl" showText={true} showSlogan={true} variant="light" />
        </div>
        <p className="mt-1 text-sm font-semibold text-emerald-400 tracking-wide">
          "Organize seu dinheiro. Recupere o controle."
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200/80">
          {/* Tabs: Entrar vs Criar Conta */}
          <div className="flex border-b border-slate-100 pb-3 mb-6">
            <button
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
              }}
              className={`flex-1 text-center font-bold text-sm pb-2 border-b-2 transition-all ${
                !isRegister
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setErrorMsg('');
              }}
              className={`flex-1 text-center font-bold text-sm pb-2 border-b-2 transition-all ${
                isRegister
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="João da Silva"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Senha {isRegister && '(mínimo 6 dígitos)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Processando...' : isRegister ? 'Cadastrar' : 'Entrar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Biometrics Login Shortcut (if available and login mode) */}
          {!isRegister && isBiometricsAvailable && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                <span>Entrar com Biometria / Touch ID / Face ID</span>
              </button>
            </div>
          )}

          {/* Trust and Local Storage Guarantee */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dados 100% privados e salvos localmente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
