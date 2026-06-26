import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

import { authApi, refreshAccessToken, isTokenExpired } from '../services/api';

import type { User } from '../types';



interface AuthContextType {

  user: User | null;

  loading: boolean;

  login: (email: string, password: string) => Promise<User>;

  register: (name: string, email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

}



const AuthContext = createContext<AuthContextType | null>(null);



export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);



  const refreshUser = useCallback(async () => {

    try {

      const { data } = await authApi.getMe();

      setUser(data.data);

    } catch {

      setUser(null);

    }

  }, []);



  useEffect(() => {

    const bootstrap = async () => {

      const accessToken = localStorage.getItem('accessToken');

      const refreshToken = localStorage.getItem('refreshToken');



      if (!accessToken && !refreshToken) {

        setLoading(false);

        return;

      }



      if (!accessToken || isTokenExpired(accessToken)) {

        const newToken = await refreshAccessToken();

        if (!newToken) {

          setUser(null);

          setLoading(false);

          return;

        }

      }



      await refreshUser();

      setLoading(false);

    };



    bootstrap();

  }, [refreshUser]);



  const login = async (email: string, password: string) => {

    const { data } = await authApi.login({ email, password });

    localStorage.setItem('accessToken', data.data.accessToken);

    localStorage.setItem('refreshToken', data.data.refreshToken);

    setUser(data.data.user);

    return data.data.user as User;

  };



  const register = async (name: string, email: string, password: string) => {

    const { data } = await authApi.register({ name, email, password });

    localStorage.setItem('accessToken', data.data.accessToken);

    localStorage.setItem('refreshToken', data.data.refreshToken);

    setUser(data.data.user);

  };



  const logout = async () => {

    try {

      await authApi.logout();

    } finally {

      localStorage.removeItem('accessToken');

      localStorage.removeItem('refreshToken');

      setUser(null);

    }

  };



  return (

    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>

      {children}

    </AuthContext.Provider>

  );

}



export function useAuth() {

  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error('useAuth must be used within AuthProvider');

  return ctx;

}


