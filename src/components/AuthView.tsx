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
