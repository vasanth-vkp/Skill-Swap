import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('walletBalance');
    return saved ? parseFloat(saved) : 0;
  });
  const [newlyRegistered, setNewlyRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('walletBalance');
    setToken(null);
    setUser(null);
    setWalletBalance(0);
    setNewlyRegistered(false);
  }, []);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      const data = response.data;
      const currentUser = {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
      if (data.walletBalance !== undefined && data.walletBalance !== null) {
        const bal = parseFloat(data.walletBalance);
        setWalletBalance(bal);
        localStorage.setItem('walletBalance', bal.toString());
      }
    } catch (err) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    checkAuth();

    const handleExpired = () => {
      clearAuth();
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [checkAuth, clearAuth]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    const loggedUser = {
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    const balance = parseFloat(data.walletBalance ?? 0);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('walletBalance', balance.toString());

    setToken(data.token);
    setUser(loggedUser);
    setWalletBalance(balance);
    setNewlyRegistered(false);

    return data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const data = response.data;

    const registeredUser = {
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    const balance = parseFloat(data.walletBalance ?? 5);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    localStorage.setItem('walletBalance', balance.toString());

    setToken(data.token);
    setUser(registeredUser);
    setWalletBalance(balance);
    setNewlyRegistered(true);

    return data;
  };

  const dismissWelcomeModal = () => {
    setNewlyRegistered(false);
  };

  const logout = () => {
    clearAuth();
  };

  const value = {
    user,
    token,
    walletBalance,
    isAuthenticated: !!token && !!user,
    newlyRegistered,
    loading,
    login,
    register,
    logout,
    dismissWelcomeModal,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
