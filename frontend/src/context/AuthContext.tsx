'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BRAND_CONFIG } from '../utils/brandConfig';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'USER' | 'PHARMACIST' | 'ADMIN';
  is2FAEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (email: string, name: string, googleId: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  toggle2FA: () => Promise<{ success: boolean; is2FAEnabled: boolean; secret?: string }>;
  changePassword: (current: string, newPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser && storedUser !== 'undefined') {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse auth_user from localStorage:", err);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        setLoading(false);
        return;
      }
      
      // Verify session token validity in the background
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      })
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Invalid response or non-JSON content");
      })
      .then(data => {
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        } else {
          // Token expired or invalid
          logout();
        }
      })
      .catch(() => {
        // Offline or connection failed, keep stored details as fallback
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to log in.");
        return false;
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      setError("Unable to connect to security authentication servers.");
      return false;
    }
  };

  const googleLogin = async (email: string, name: string, googleId: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, googleId })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to log in via Google.");
        return false;
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      setError("Google single sign-on authentication connection error.");
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to register account.");
        return false;
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      setError("Registration server connection timeout.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const toggle2FA = async (): Promise<{ success: boolean; is2FAEnabled: boolean; secret?: string }> => {
    if (!token) return { success: false, is2FAEnabled: false };
    try {
      const res = await fetch(`${API_URL}/auth/2fa/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (user) {
          const updatedUser = { ...user, is2FAEnabled: data.is2FAEnabled };
          setUser(updatedUser);
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }
        return { success: true, is2FAEnabled: data.is2FAEnabled, secret: data.secret };
      }
      return { success: false, is2FAEnabled: false };
    } catch (err) {
      return { success: false, is2FAEnabled: false };
    }
  };

  const changePassword = async (current: string, newPass: string): Promise<boolean> => {
    if (!token) return false;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Password change failed.");
        return false;
      }
      return true;
    } catch (err) {
      setError("Password updates server offline.");
      return false;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      googleLogin,
      register,
      logout,
      clearError,
      toggle2FA,
      changePassword
    }}>
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
