import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { getAuthToken, setAuthToken } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('bidya_language') || 'en-IN'
  );

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem('bidya_language', lang);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data && data.success && data.user) {
        setUser(data.user);
        setHasProfile(!!data.hasProfile);
        if (data.user.preferredLanguage) {
          setLanguageState(data.user.preferredLanguage);
          localStorage.setItem('bidya_language', data.user.preferredLanguage);
        }
        return data.user;
      } else {
        setUser(null);
        setAuthToken('');
        return null;
      }
    } catch (err) {
      // If error occurs and no active session, clear user state
      setUser(null);
      setAuthToken('');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize authentication on application launch
  useEffect(() => {
    checkAuth();

    // Listen for automatic session expiry from API interceptor
    const handleSessionExpired = () => {
      setUser(null);
      setAuthToken('');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [checkAuth]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.preferredLanguage) {
          setLanguageState(data.user.preferredLanguage);
          localStorage.setItem('bidya_language', data.user.preferredLanguage);
        }
        return data;
      }
      throw new Error(data.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, preferredLang) => {
    setIsLoading(true);
    try {
      const selectedLang = preferredLang || language;
      const data = await authService.register(name, email, password, selectedLang);
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.preferredLanguage) {
          setLanguageState(data.user.preferredLanguage);
          localStorage.setItem('bidya_language', data.user.preferredLanguage);
        }
        return data;
      }
      throw new Error(data.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setAuthToken('');
      setIsLoading(false);
    }
  };

  const logoutAll = async () => {
    setIsLoading(true);
    try {
      await authService.logoutAll();
    } finally {
      setUser(null);
      setAuthToken('');
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loading: isLoading, // backward-compatibility alias
    hasProfile,
    setHasProfile,
    language,
    setLanguage,
    login,
    register,
    logout,
    logoutAll,
    refreshUser: checkAuth,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
