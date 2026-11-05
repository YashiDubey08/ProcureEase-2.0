import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authStorage } from '../services/api';
import type { User, StartupProfile } from '../types';

interface AuthContextType {
  user: User | null;
  startup: StartupProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company_name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginDemo: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; dev_reset_token?: string }>;
  resetPassword: (token: string, new_password: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token?: string) => Promise<void>;
  resendVerification: () => Promise<string | undefined>;
  changePassword: (current_password: string, new_password: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [startup, setStartup] = useState<StartupProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      const res = await api.getMe();
      if (res.authenticated && res.user) {
        setUser(res.user);
        setStartup(res.startup || null);
      } else {
        authStorage.clearToken();
        setUser(null);
        setStartup(null);
      }
    } catch (err) {
      console.warn('Authentication check failed:', err);
      authStorage.clearToken();
      setUser(null);
      setStartup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.user) {
        setUser(res.user);
        setStartup(res.startup || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, company_name: string) => {
    setLoading(true);
    try {
      const res = await api.register({ name, email, password, company_name });
      if (res.user) {
        setUser(res.user);
        setStartup(res.startup || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async () => {
    setLoading(true);
    try {
      const res = await api.loginDemo();
      if (res.user) {
        setUser(res.user);
        setStartup(res.startup || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      authStorage.clearToken();
      setUser(null);
      setStartup(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const prof = await api.getProfile();
      if (prof.profile) setStartup(prof.profile);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const forgotPassword = async (email: string) => {
    return api.forgotPassword(email);
  };

  const resetPassword = async (token: string, new_password: string) => {
    return api.resetPassword(token, new_password);
  };

  const verifyEmail = async (token?: string) => {
    const res = await api.verifyEmail(token);
    if (user && res.email_verified) {
      setUser({ ...user, email_verified: true });
    }
  };

  const resendVerification = async () => {
    const res = await api.resendVerification();
    return res.dev_verification_token;
  };

  const changePassword = async (current_password: string, new_password: string) => {
    await api.changePassword(current_password, new_password);
  };

  const deleteAccount = async (password: string) => {
    await api.deleteAccount(password);
    authStorage.clearToken();
    setUser(null);
    setStartup(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        startup,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        loginDemo,
        refreshProfile,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        changePassword,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
