import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState(
    localStorage.getItem('bidya_language') || 'en-IN'
  );

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('bidya_language', lang);
    if (user) {
      api.auth.updateMe({ preferredLanguage: lang }).catch(() => {});
    }
  };

  const checkAuth = async () => {
    const existingToken = getAuthToken();
    if (!existingToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        setHasProfile(data.hasProfile);
        if (data.user.preferredLanguage) {
          setLanguageState(data.user.preferredLanguage);
          localStorage.setItem('bidya_language', data.user.preferredLanguage);
        }
      } else {
        setAuthToken('');
        setUser(null);
      }
    } catch (err) {
      console.warn('Auth token invalid or expired:', err.message);
      setAuthToken('');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    if (data.success && data.accessToken) {
      setAuthToken(data.accessToken);
      setUser(data.user);
      if (data.user.preferredLanguage) {
        setLanguageState(data.user.preferredLanguage);
      }
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (name, email, password, preferredLanguage) => {
    const data = await api.auth.register({
      name,
      email,
      password,
      preferredLanguage: preferredLanguage || language,
    });
    if (data.success && data.accessToken) {
      setAuthToken(data.accessToken);
      setUser(data.user);
      if (data.user.preferredLanguage) {
        setLanguageState(data.user.preferredLanguage);
      }
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    setAuthToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hasProfile,
        setHasProfile,
        loading,
        login,
        register,
        logout,
        language,
        setLanguage,
        refreshUser: checkAuth,
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

