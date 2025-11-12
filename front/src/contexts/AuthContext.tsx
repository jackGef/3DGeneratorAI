import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, clearTokens, getAccessToken } from '../services/api';

interface User {
  id: string;
  email: string;
  userName: string;
  roles: string[];
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, userName: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getAccessToken();
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadUser() {
    try {
      const data = await authAPI.getMe();
      setUser({
        id: data._id,
        email: data.email,
        userName: data.userName,
        roles: data.roles,
        emailVerified: data.emailVerified,
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      clearTokens();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const data = await authAPI.login(email, password);
    setUser({
      id: data.user.id,
      email: data.user.email,
      userName: data.user.userName,
      roles: data.user.roles,
      emailVerified: data.user.emailVerified,
    });
  }

  async function logout() {
    await authAPI.logout();
    setUser(null);
    clearTokens();
  }

  async function register(email: string, userName: string, password: string) {
    await authAPI.register(email, userName, password);
  }

  async function verifyEmail(email: string, code: string) {
    await authAPI.verifyEmail(email, code);
  }

  async function refreshUser() {
    await loadUser();
  }

  const isAdmin = user?.roles?.includes('admin') || false;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, verifyEmail, refreshUser, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
