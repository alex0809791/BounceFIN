import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { exportUserData, importUserData } from '../utils/storage';
import {
  User,
  Camera,
  KeyRound,
  Fingerprint,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateProfile,
    updatePassword,
    registerBiometrics,
    isBiometricsAvailable,
    logout,
  } = useAuth();
  const { refreshData } = useFinance();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Biometrics
  const [bioMsg, setBioMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Backup & Restore
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMsg, setBackupMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const filePhotoRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate MIME type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setProfileMsg({ text: 'Formato inválido. Por favor, envie uma imagem PNG, JPG, WEBP ou GIF.', error: true });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setProfileMsg({ text: 'A imagem deve ter no máximo 2MB.', error: true });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Verify base64 starts with valid image data URI
        if (typeof base64 === 'string' && base64.startsWith('data:image/')) {
          setAvatarUrl(base64);
        } else {
          setProfileMsg({ text: 'Arquivo de imagem inválido.', error: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    const res = await updateProfile(name, avatarUrl);
    if (res.success) {
      setProfileMsg({ text: 'Perfil atualizado com sucesso!' });
    } else {
      setProfileMsg({ text: res.error || 'Erro ao atualizar perfil.', error: true });
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'A confirmação de senha não confere.', error: true });
      return;
    }

    const res = await updatePassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ text: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ text: res.error || 'Erro ao alterar senha.', error: true });
    }
  };

  const handleRegisterBiometrics = async () => {
    setBioMsg(null);
    const res = await registerBiometrics();
    if (res.success) {
      setBioMsg({ text: 'Biometria/Passkey ativada com sucesso neste dispositivo!' });
    } else {
      setBioMsg({ text: res.error || 'Não foi possível configurar a biometria.', error: true });
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const json = exportUserData(user.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bouncefin_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMsg({ text: 'Backup exportado com sucesso!' });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const success = importUserData(user.id, text);
      if (success) {
        refreshData();
        setBackupMsg({ text: 'Dados restaurados com sucesso!' });
      } else {
        setBackupMsg({ text: 'Arquivo de backup inválido.', error: true });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Configurações & Perfil
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie suas informações pessoais, segurança, foto e dados do BounceFIN.
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Perfil do Usuário
        </h3>

        {profileMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              profileMsg.error
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {profileMsg.error ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Avatar upload */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-slate-100">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Foto do perfil"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl ring-4 ring-emerald-500/20">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <button
                type="button"
                onClick={() => filePhotoRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full hover:bg-emerald-600 shadow-md transition-colors"
                title="Escolher foto do dispositivo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>

              <input
                ref={filePhotoRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left">
              <span className="text-sm font-bold text-slate-800 block">
                Foto de Perfil
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                PNG, JPG ou GIF até 2MB. Aparece no topo do site e no menu.
              </span>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => filePhotoRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Alterar Foto
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Remover Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                E-mail (Login)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              Salvar Dados do Perfil
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          Alterar Senha
        </h3>

        {passwordMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              passwordMsg.error
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {passwordMsg.error ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSavePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Senha Atual
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full sm:max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nova Senha (mínimo 6 dígitos)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              Atualizar Senha
            </button>
          </div>
        </form>
      </div>

      {/* Biometrics & Security Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-emerald-600" />
          Segurança por Biometria / Reconhecimento Facial (WebAuthn / Passkeys)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Utiliza a tecnologia padrão e segura do navegador (Touch ID, Face ID ou Windows Hello) para acesso rápido.
        </p>

        {bioMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              bioMsg.error
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {bioMsg.error ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{bioMsg.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Acesso Biométrico / Chave de Segurança
              </span>
              {user?.hasBiometrics && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Ativado
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBiometricsAvailable
                ? 'Dispositivo compatível com leitor de biometria ou reconhecimento facial.'
                : 'Seu navegador ou dispositivo atual não oferece suporte ao WebAuthn.'}
            </p>
          </div>

          <button
            onClick={handleRegisterBiometrics}
            disabled={!isBiometricsAvailable}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors ${
              isBiometricsAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>{user?.hasBiometrics ? 'Reconfigurar Biometria' : 'Ativar Biometria'}</span>
          </button>
        </div>
      </div>

      {/* Backup & Persistence Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Backup e Restauração de Dados
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Seus dados são salvos localmente de forma persistente. Você também pode exportar um backup em arquivo JSON ou restaurá-lo em qualquer outro computador.
        </p>

        {backupMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              backupMsg.error
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{backupMsg.text}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors border border-slate-200"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Backup (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors border border-slate-200"
          >
            <Upload className="w-4 h-4" />
            <span>Restaurar de Arquivo</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Session Logout Action */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm rounded-xl transition-colors border border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Encerrar Sessão (Sair da Conta)</span>
        </button>
      </div>
    </div>
  );
};
