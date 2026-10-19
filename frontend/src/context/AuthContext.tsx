import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
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
        localStorage.setItem('procureease_user_id', res.user.id);
      } else {
        // Check if there was a saved user in localStorage as fallback
        const savedId = localStorage.getItem('procureease_user_id');
        const savedEmail = localStorage.getItem('procureease_user_email');
        const savedName = localStorage.getItem('procureease_user_name');
        const savedCompany = localStorage.getItem('procureease_user_company');
        if (savedId && savedEmail) {
          setUser({
            id: savedId,
            name: savedName || 'Founder',
            email: savedEmail,
            company_name: savedCompany || 'Startup'
          });
        } else {
          setUser(null);
          setStartup(null);
        }
      }
    } catch (err) {
      console.warn('Auth check fallback:', err);
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
        localStorage.setItem('procureease_user_id', res.user.id);
        localStorage.setItem('procureease_user_email', res.user.email);
        localStorage.setItem('procureease_user_name', res.user.name);
        localStorage.setItem('procureease_user_company', res.user.company_name);
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
        localStorage.setItem('procureease_user_id', res.user.id);
        localStorage.setItem('procureease_user_email', res.user.email);
        localStorage.setItem('procureease_user_name', res.user.name);
        localStorage.setItem('procureease_user_company', res.user.company_name);
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
        localStorage.setItem('procureease_user_id', res.user.id);
        localStorage.setItem('procureease_user_email', res.user.email);
        localStorage.setItem('procureease_user_name', res.user.name);
        localStorage.setItem('procureease_user_company', res.user.company_name);
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
      localStorage.removeItem('procureease_user_id');
      localStorage.removeItem('procureease_user_email');
      localStorage.removeItem('procureease_user_name');
      localStorage.removeItem('procureease_user_company');
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
        refreshProfile
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
