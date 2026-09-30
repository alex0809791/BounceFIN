import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BounceFinLogo } from './BounceFinLogo';
import {
  QrCode,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  LogOut,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const SubscriptionBlockView: React.FC = () => {
  const { user, logout, markSubscriptionActive, resetTrial } = useAuth();
  const [copiedKey, setCopiedKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // PIX details
  const pixKey = 'pix@bouncefin.com.br';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      setTimeout(() => {
        markSubscriptionActive();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full relative z-10 space-y-6">
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BounceFinLogo size="lg" showText={true} showSlogan={true} variant="light" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mt-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Período de teste de 35 dias expirado</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Seu período de degustação gratuita terminou
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Esperamos que você tenha aproveitado os 35 dias para organizar seu dinheiro! Para continuar usando todas as ferramentas de gestão local, ative sua assinatura via PIX.
              </p>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Acesso Vitalício aos seus dados
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                R$ 19,90 <span className="text-xs font-medium text-slate-500">/mês no PIX</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sem renovação automática abusiva e sem necessidade de cartão de crédito.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sem fidelidade</span>
            </div>
          </div>

          {/* PIX Payment Section */}
          <div className="space-y-4 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">
                Pagamento Instantâneo via PIX
              </h3>
            </div>

            {/* QR Code Graphic Display */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-900 text-white">
              <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="10" y="10" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="18" y="18" width="9" height="9" fill="currentColor" />
                  <rect x="65" y="10" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="73" y="18" width="9" height="9" fill="currentColor" />
                  <rect x="10" y="65" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="18" y="73" width="9" height="9" fill="currentColor" />
                  <circle cx="50" cy="50" r="10" fill="#10b981" />
                  <rect x="42" y="15" width="16" height="6" fill="currentColor" />
                  <rect x="42" y="27" width="16" height="6" fill="currentColor" />
                  <rect x="15" y="42" width="6" height="16" fill="currentColor" />
                  <rect x="27" y="42" width="6" height="16" fill="currentColor" />
                  <rect x="65" y="42" width="25" height="6" fill="currentColor" />
                  <rect x="65" y="55" width="15" height="6" fill="currentColor" />
                  <rect x="42" y="65" width="16" height="25" fill="currentColor" />
                  <rect x="65" y="70" width="25" height="20" fill="currentColor" />
                </svg>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Chave PIX Oficial
                </span>
                <div className="font-mono text-xs sm:text-sm bg-slate-800 px-3 py-2 rounded-xl text-slate-200 border border-slate-700 truncate">
                  {pixKey}
                </div>
                <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                  <button
                    onClick={handleCopyPix}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instruction steps */}
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>Abra o aplicativo do seu banco de preferência;</li>
              <li>Escolha a opção <strong>PIX</strong> e escaneie o QR Code ou cole a chave <strong>{pixKey}</strong>;</li>
              <li>Confirme o valor de <strong>R$ 19,90</strong> para BounceFIN;</li>
              <li>Após o pagamento, clique no botão de liberação abaixo para liberar seu painel imediatamente.</li>
            </ol>

            {/* Confirmation CTA */}
            {verifiedSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold">
                  Pagamento confirmado! Carregando seu painel BounceFIN...
                </span>
              </div>
            ) : (
              <button
                onClick={handleSimulatePayment}
                disabled={isVerifying}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Validando pagamento PIX...</span>
                  </>
                ) : (
                  <>
                    <span>Já realizei o pagamento via PIX</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* User info & Sign out */}
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Conectado como <strong className="text-slate-800">{user?.email}</strong>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetTrial}
                title="Para fins de teste e demonstração"
                className="text-slate-400 hover:text-slate-600 underline text-[11px]"
              >
                Reiniciar teste (35 dias)
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Trocar de Conta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
