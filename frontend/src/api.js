const BASE_URL = '/api/v1';

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

async function request(endpoint, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await res.json();
  } else if (contentType.includes('audio/')) {
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
};

