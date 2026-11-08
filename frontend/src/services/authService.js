import { api, setAuthToken } from './api';

export const authService = {
  login: async (email, password) => {
    const data = await api.auth.login({ email, password });
    if (data.success && data.accessToken) {
      setAuthToken(data.accessToken);
    }
    return data;
  },

  register: async (name, email, password, preferredLanguage) => {
    const data = await api.auth.register({
      name,
      email,
      password,
      preferredLanguage,
    });
    if (data.success && data.accessToken) {
      setAuthToken(data.accessToken);
    }
    return data;
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setAuthToken('');
    }
  },

  logoutAll: async () => {
    try {
      await api.auth.logoutAll();
    } catch (e) {
      // Ignore
    } finally {
      setAuthToken('');
    }
  },

  getCurrentUser: async () => {
    return await api.auth.getMe();
  },

  refreshToken: async () => {
    return await api.auth.refreshToken();
  },

  forgotPassword: async (email) => {
    return await api.auth.forgotPassword(email);
  },

  resetPassword: async (token, password) => {
    return await api.auth.resetPassword(token, password);
  },

  verifyEmail: async (token) => {
    return await api.auth.verifyEmail(token);
  },
};

export default authService;
