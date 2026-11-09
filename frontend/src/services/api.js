const API_ORIGIN = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://bidyaguru-gnaniai.onrender.com' : '')
).replace(/\/+$/, '');
const BASE_URL = `${API_ORIGIN}/api/v1`;

let token = localStorage.getItem('bidya_token') || '';

export const setAuthToken = (newToken) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('bidya_token', newToken);
  } else {
    localStorage.removeItem('bidya_token');
  }
};

export const getAuthToken = () => token;

// Single-flight token refresh management
let isRefreshing = false;
let refreshPromise = null;

/**
 * Perform token refresh request to backend with cookie or stored refresh token
 */
const executeRefreshToken = async () => {
  try {
    const res = await fetch(`${API_ORIGIN}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Refresh token expired or invalid');
    }

    const data = await res.json();
    if (data.success && data.accessToken) {
      setAuthToken(data.accessToken);
      return data.accessToken;
    }
    throw new Error('Failed to obtain new access token');
  } catch (err) {
    setAuthToken('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    throw err;
  }
};

/**
 * Unified request function with automatic token refresh on 401
 */
async function request(endpoint, options = {}, isRetry = false) {
  const headers = {
    ...(options.headers || {}),
  };

  const currentToken = getAuthToken();
  if (currentToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Ensure cookies are sent with all requests
      headers,
    });
  } catch (networkErr) {
    const err = new Error(networkErr.message || 'Network connection failed');
    err.isNetworkError = true;
    throw err;
  }

  // 401 Unauthorized handling with Token Refresh Interceptor
  const isAuthEndpoint =
    endpoint.includes('/auth/login') ||
    endpoint.includes('/auth/register') ||
    endpoint.includes('/auth/refresh') ||
    endpoint.includes('/auth/logout');

  if (res.status === 401 && !isRetry && !isAuthEndpoint) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = executeRefreshToken()
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        // Retry original request once with new access token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        return await request(
          endpoint,
          {
            ...options,
            headers: retryHeaders,
          },
          true
        );
      }
    } catch (_refreshError) {
      const err = new Error('Session expired. Please log in again.');
      err.status = 401;
      err.data = { sessionExpired: true };
      throw err;
    }
  }

  const contentType = res.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await res.json();
  } else if (
    contentType.includes('audio/') ||
    contentType.includes('application/pdf') ||
    contentType.includes('application/octet-stream')
  ) {
    const blob = await res.blob();
    return blob;
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = data?.message || res.statusText || 'Request failed';
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    logout: () =>
      request('/auth/logout', {
        method: 'POST',
      }),
    logoutAll: () =>
      request('/auth/logout-all', {
        method: 'POST',
      }),
    refreshToken: () => executeRefreshToken(),
    getMe: () => request('/me'),
    updateMe: (data) =>
      request('/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    forgotPassword: (email) =>
      request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token, password) =>
      request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }),
    verifyEmail: (token) =>
      request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  },

  // Personal Profile & Complete Unified Profile
  profile: {
    get: () => request('/profile'),
    update: (data) =>
      request('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getComplete: () => request('/profile/complete'),
  },

  // Career Profile & Skills Matrix
  careerProfile: {
    get: () => request('/career-profile'),
    update: (data) =>
      request('/career-profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    addSkill: (skill) =>
      request('/career-profile/skills', {
        method: 'POST',
        body: JSON.stringify(skill),
      }),
    updateSkill: (skillId, data) =>
      request(`/career-profile/skills/${skillId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteSkill: (skillId) =>
      request(`/career-profile/skills/${skillId}`, {
        method: 'DELETE',
      }),
  },

  // Career
  career: {
    analyze: (input, language) =>
      request('/career/analyze', {
        method: 'POST',
        body: JSON.stringify({ input, language }),
      }),
    getProfile: () => request('/career/profile'),
    updateProfile: (profileData) =>
      request('/career/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },

  // Roadmap
  roadmap: {
    generate: (params) =>
      request('/roadmaps/generate', {
        method: 'POST',
        body: JSON.stringify(params || {}),
      }),
    getCurrent: () => request('/roadmaps/current'),
    updateItemStatus: (itemId, status) =>
      request(`/roadmaps/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Communication
  communication: {
    getPrompts: () => request('/communication/prompts'),
    submitPractice: (prompt, transcript, language) =>
      request('/communication/practice', {
        method: 'POST',
        body: JSON.stringify({ prompt, transcript, language }),
      }),
    chat: (message, language, history, activeTopic) =>
      request('/communication/chat', {
        method: 'POST',
        body: JSON.stringify({ message, language, history, activeTopic }),
      }),
    getHistory: () => request('/communication/history'),
  },

  // Voice (Gnani + Gemini)
  voice: {
    chat: (message, language, history) =>
      request('/voice/chat', {
        method: 'POST',
        body: JSON.stringify({ message, language, history }),
      }),
    synthesize: async (text, language, voice) => {
      const blob = await request('/voice/synthesize', {
        method: 'POST',
        body: JSON.stringify({ text, language, voice }),
      });
      return URL.createObjectURL(blob);
    },
    transcribe: (audioBlob, language) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('language', language || 'en-IN');
      return request('/voice/transcribe', {
        method: 'POST',
        body: formData,
      });
    },
  },

  // Progress
  progress: {
    getSummary: () => request('/progress/summary'),
  },

  // Job Match & Apply
  jobs: {
    getMatched: (params = {}) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.append(k, v);
      });
      const query = qs.toString();
      return request(`/jobs${query ? `?${query}` : ''}`);
    },
    getDetails: (jobId) => request(`/jobs/${jobId}`),
    apply: (data) =>
      request('/jobs/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getApplications: () => request('/jobs/applications'),
    getResume: () => request('/jobs/resume'),
    uploadResume: (data) =>
      request('/jobs/resume/upload', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),
  },

  // ATS Resume Profile Builder
  resume: {
    get: () => request('/resume'),
    save: (data) =>
      request('/resume', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (data) =>
      request('/resume', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: () =>
      request('/resume', {
        method: 'DELETE',
      }),
    downloadPdf: async () => {
      const blob = await request('/resume/pdf');
      return blob;
    },
  },
};

export default api;
