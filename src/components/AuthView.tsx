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
  CheckCircle2,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { BounceFinLogo } from './BounceFinLogo';

export const AuthView: React.FC = () => {
  const {
    login,
    register,
    loginWithBiometrics,
    isBiometricsAvailable,
    requestPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await register(name, email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Erro ao criar conta.');
        }
      } else if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Credenciais inválidas.');
        }
      } else if (mode === 'forgot') {
        const res = await requestPasswordReset(email);
        if (!res.success) {
          setErrorMsg(res.error || 'Erro ao solicitar recuperação de senha.');
        } else {
          setSuccessMsg(res.message || 'E-mail de recuperação enviado com sucesso!');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro inesperado.');
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
      setErrorMsg(err?.message || 'Erro na verificação biométrica.');
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
          {/* Header Mode Switcher (Login vs Cadastro) */}
          {mode !== 'forgot' ? (
            <div className="flex border-b border-slate-100 pb-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 text-center font-bold text-sm pb-2 border-b-2 transition-all ${
                  mode === 'login'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 text-center font-bold text-sm pb-2 border-b-2 transition-all ${
                  mode === 'register'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Criar Conta
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao login</span>
              </button>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Recuperação
              </span>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu Nome (Opcional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="João da Silva"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>35 dias de teste grátis sem cartão de crédito ou CPF</span>
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

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Senha {mode === 'register' && '(mínimo 6 dígitos)'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
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
            )}

            {mode === 'forgot' && (
              <p className="text-xs text-slate-500 leading-relaxed">
                Informe o seu e-mail cadastrado. Enviaremos um link seguro pelo Supabase apontando para <strong>https://bouncefin.com.br</strong> para você redefinir sua senha com facilidade.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Processando...'
                  : mode === 'register'
                  ? 'Criar Conta (35 dias grátis)'
                  : mode === 'login'
                  ? 'Entrar'
                  : 'Enviar E-mail de Recuperação'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Biometrics Login Shortcut (if available and login mode) */}
          {mode === 'login' && isBiometricsAvailable && (
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
            <span>Autenticação Supabase • 35 dias de teste grátis</span>
          </div>
        </div>
      </div>
    </div>
  );
};
