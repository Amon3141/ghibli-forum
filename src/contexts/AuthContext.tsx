'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface UserInfo {
  id: number;
  userId: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userId: string, username: string, password: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/me');
      setUser(response.data.user);
    } catch (err: unknown) {
      setUser(null);
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.log((err as any).response?.data?.error);
      } else {
        console.log('エラーが発生しました');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        identifier,
        password
      });
      setUser(response.data.user);
    } catch (err: unknown) {
      setUser(null);
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.log((err as any).response?.data?.error);
      } else {
        console.log('エラーが発生しました');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userId: string, username: string, password: string, email: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        userId, username, password, email
      });
      setUser(response.data.user);
    } catch (err: unknown) {
      setUser(null);
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.log((err as any).response?.data?.error);
      } else {
        console.log('エラーが発生しました');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await api.post('/auth/logout');
    setUser(null);
    setLoading(false);
  };

  // Check authentication status on mount
  useEffect(() => {
    try {
      checkAuth();
    } catch (err) {
      router.replace('/auth/login');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
