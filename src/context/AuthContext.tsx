"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api-client';

interface User {
  id: number;
  username: string;
  email: string;
  mobile: string;
  address?: string;
  role: 'admin' | 'distributor' | 'customer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    username: string;
    email: string;
    mobile: string;
    password: string;
    address?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login({ email, password });

      if (response.error) {
        return { success: false, error: response.error };
      }

      const responseData = response.data as { token?: string; user?: User } | undefined;
      if (responseData?.token && responseData?.user) {
        const { token: newToken, user: userData } = responseData;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    mobile: string;
    password: string;
    address?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Legacy register wrapper: map username into first/last name
      const response = await authApi.register({
        first_name: userData.username,
        last_name: userData.username,
        email: userData.email,
        mobile: userData.mobile,
        password: userData.password,
        address: userData.address,
      });

      if (response.error) {
        return { success: false, error: response.error };
      }

      // New registration flow: backend no longer returns token here.
      // This method is kept for backward compatibility (admin flows, etc.).
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

