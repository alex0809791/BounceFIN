import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  getStoredUsers,
  saveStoredUsers,
  getActiveUserId,
  setActiveUserId,
} from '../utils/storage';
import {
  hashPassword,
  generateSalt,
  isWebAuthnSupported,
  registerBiometricPasskey,
  authenticateWithBiometrics,
} from '../utils/crypto';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isBiometricsAvailable: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, avatarUrl?: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  registerBiometrics: () => Promise<{ success: boolean; error?: string }>;
  loginWithBiometrics: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check biometrics platform support
    isWebAuthnSupported().then(supported => {
      setIsBiometricsAvailable(supported);
    });

    // Check active session
    const activeId = getActiveUserId();
    if (activeId) {
      const users = getStoredUsers();
      const current = users.find(u => u.id === activeId);
      if (current) {
        setUser(current);
      } else {
        setActiveUserId(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!existing) {
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }

    const computedHash = await hashPassword(password, existing.salt);
    if (computedHash !== existing.passwordHash) {
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }

    setUser(existing);
    setActiveUserId(existing.id);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !password || !trimmedName) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' };
    }

    const users = getStoredUsers();
    const exists = users.some(u => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { success: false, error: 'Já existe uma conta cadastrada com este e-mail.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const newUser: UserProfile = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      email: trimmedEmail,
      name: trimmedName,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      hasBiometrics: false,
    };

    const updatedUsers = [...users, newUser];
    saveStoredUsers(updatedUsers);
    setUser(newUser);
    setActiveUserId(newUser.id);
    return { success: true };
  };

  const logout = () => {
    setActiveUserId(null);
    setUser(null);
  };

  const updateProfile = async (name: string, avatarUrl?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado.' };
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'O nome não pode estar em branco.' };
    }

    const users = getStoredUsers();
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          name: trimmedName,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : u.avatarUrl,
        };
      }
      return u;
    });

    saveStoredUsers(updatedUsers);
    const updated = updatedUsers.find(u => u.id === user.id) || null;
    setUser(updated);
    return { success: true };
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado.' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const computedCurrent = await hashPassword(currentPassword, user.salt);
    if (computedCurrent !== user.passwordHash) {
      return { success: false, error: 'A senha atual está incorreta.' };
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(newPassword, newSalt);

    const users = getStoredUsers();
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          passwordHash: newHash,
          salt: newSalt,
        };
      }
      return u;
    });

    saveStoredUsers(updatedUsers);
    const updated = updatedUsers.find(u => u.id === user.id) || null;
    setUser(updated);
    return { success: true };
  };

  const registerBiometrics = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado.' };
    if (!isBiometricsAvailable) {
      return { success: false, error: 'Biometria/Passkey não é suportada neste navegador ou dispositivo.' };
    }

    try {
      const res = await registerBiometricPasskey(user.id, user.email, user.name);
      if (res.success && res.credentialId) {
        const users = getStoredUsers();
        const updatedUsers = users.map(u => {
          if (u.id === user.id) {
            return {
              ...u,
              hasBiometrics: true,
              biometricCredentialId: res.credentialId,
            };
          }
          return u;
        });
        saveStoredUsers(updatedUsers);
        const updated = updatedUsers.find(u => u.id === user.id) || null;
        setUser(updated);
        return { success: true };
      }
      return { success: false, error: 'Falha ao registrar biometria.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao configurar biometria.' };
    }
  };

  const loginWithBiometrics = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isBiometricsAvailable) {
      return { success: false, error: 'Biometria não suportada neste dispositivo.' };
    }

    try {
      const users = getStoredUsers();
      const bioUsers = users.filter(u => u.hasBiometrics);
      if (bioUsers.length === 0) {
        return { success: false, error: 'Nenhuma conta configurada com biometria neste navegador.' };
      }

      // If one user has biometrics, use their credentialId, otherwise pass undefined to let authenticator pick
      const targetCredentialId = bioUsers.length === 1 ? bioUsers[0].biometricCredentialId : undefined;
      const success = await authenticateWithBiometrics(targetCredentialId);
      if (success) {
        // Authenticate the matching biometric user
        const authenticatedUser = bioUsers[0];
        setUser(authenticatedUser);
        setActiveUserId(authenticatedUser.id);
        return { success: true };
      }
      return { success: false, error: 'Autenticação biométrica não concluída.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro na autenticação biométrica.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isBiometricsAvailable,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        registerBiometrics,
        loginWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
