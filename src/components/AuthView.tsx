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
} from 'lucide-react';
import { BounceFinLogo } from './BounceFinLogo';

export const AuthView: React.FC = () => {
  const { login, register, loginWithBiometrics, isBiometricsAvailable } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
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

  const handleForgotPassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Por favor, digite o seu e-mail no campo acima para recuperar a senha.');
      return;
    }

    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuração do Supabase não encontrada nas variáveis de ambiente.');
      }

      const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setErrorMsg(errData.msg || errData.error_description || 'Erro ao enviar e-mail de recuperação.');
      } else {
        setSuccessMsg('E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao solicitar redefinição.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
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
