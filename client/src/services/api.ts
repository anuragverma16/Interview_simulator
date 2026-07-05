import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const isBrowser = typeof window !== 'undefined';

const getLS = (k: string) => (isBrowser ? window.localStorage.getItem(k) : null);
const setLS = (k: string, v: string) => { if (isBrowser) window.localStorage.setItem(k, v); };
const delLS = (k: string) => { if (isBrowser) window.localStorage.removeItem(k); };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
}

function clearTokens() {
  delLS('accessToken');
  delLS('refreshToken');
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getLS('refreshToken');
  if (!refreshToken) return null;

  if (!refreshPromise) {
    // Use bare axios (not `api`) to avoid interceptor recursion
    refreshPromise = axios
      .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken }, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(({ data }) => {
        const accessToken = data?.data?.accessToken;
        const newRefresh = data?.data?.refreshToken;
        if (!accessToken) throw new Error('No access token in refresh response');
        setLS('accessToken', accessToken);
        if (newRefresh) setLS('refreshToken', newRefresh);
        return accessToken as string;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
const isAuthRoute = (url?: string) =>
  !!url && AUTH_PATHS.some((p) => url.includes(p));

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  let token = getLS('accessToken');

  // Proactive refresh for non-auth routes
  if (token && !isAuthRoute(config.url) && isTokenExpired(token)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) token = refreshed;
  }

  if (token) config.headers.set('Authorization', `Bearer ${token}`);

  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      original &&
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthRoute(original.url)
    ) {
      original._retry = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
        return api(original);
      }

      if (isBrowser && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ---------- Auth ----------
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: async () => {
    try {
      return await api.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },
  getMe: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

export const publicApi = {
  getStats: () => api.get('/public/stats'),
};

// ---------- Users ----------
export const userApi = {
  updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/users/avatar', form);
  },
  updateSettings: (data: Record<string, unknown>) => api.put('/users/settings', data),
};

// ---------- Resume ----------
export const resumeApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/resume/upload', form);
  },
  getAll: () => api.get('/resume'),
  getOne: (id: string) => api.get(`/resume/${id}`),
  delete: (id: string) => api.delete(`/resume/${id}`),
  reanalyze: (id: string) => api.post(`/resume/${id}/reanalyze`),
};

// ---------- Skill Gap ----------
export const skillGapApi = {
  analyze: (data: Record<string, unknown>) => api.post('/skill-gap/analyze', data),
  getAll: () => api.get('/skill-gap'),
  getOne: (id: string) => api.get(`/skill-gap/${id}`),
  updateProgress: (id: string, data: Record<string, unknown>) =>
    api.put(`/skill-gap/${id}/progress`, data),
};

// ---------- Interviews ----------
export const interviewApi = {
  start: (data: Record<string, unknown>) => api.post('/interviews/start', data),
  answer: (id: string, data: Record<string, unknown>) =>
    api.post(`/interviews/${id}/answer`, data),
  followUp: (id: string, data?: Record<string, unknown>) =>
    api.post(`/interviews/${id}/follow-up`, data),
  complete: (id: string, data?: Record<string, unknown>) =>
    api.post(`/interviews/${id}/complete`, data),
  analyzeVoice: (data: Record<string, unknown>) => api.post('/interviews/voice/analyze', data),
  getAll: () => api.get('/interviews'),
  getOne: (id: string) => api.get(`/interviews/${id}`),
  getWelcome: (id: string) => api.get(`/interviews/${id}/welcome`),
  voiceTurn: (id: string, data: Record<string, unknown>) =>
    api.post(`/interviews/${id}/voice-turn`, data),
};

// ---------- Coding ----------
export const codingApi = {
  getTopics: () => api.get('/coding/topics'),
  getProblems: (params?: Record<string, unknown>) => api.get('/coding/problems', { params }),
  getProblemDetail: (slug: string) => api.get(`/coding/problems/${slug}`),
  getProblemStarter: (slug: string, language: string) =>
    api.get(`/coding/problems/${slug}/starter/${language}`),
  changeSessionLanguage: (id: string, language: string) =>
    api.post(`/coding/${id}/language`, { language }),
  getStreak: (params?: { year?: number; month?: number }) =>
    api.get('/coding/streak', { params }),
  startStreak: (data: { language: string; catchUp?: boolean; catchUpDate?: string }) =>
    api.post('/coding/streak/start', data),
  getCertificates: () => api.get('/coding/certificates'),
  getCertificateHtml: (id: string) => api.get(`/coding/certificates/${id}/html`),
  start: (data: Record<string, unknown>) => api.post('/coding/start', data),
  run: (id: string, data: Record<string, unknown>) => api.post(`/coding/${id}/run`, data),
  submit: (id: string, data: Record<string, unknown>) => api.post(`/coding/${id}/submit`, data),
  getAll: () => api.get('/coding'),
  getOne: (id: string) => api.get(`/coding/${id}`),
};

// ---------- Career ----------
export const careerApi = {
  predict: (data: Record<string, unknown>) => api.post('/career/predict', data),
  getAll: () => api.get('/career'),
  getOne: (id: string) => api.get(`/career/${id}`),
};

// ---------- Roadmap ----------
export const roadmapApi = {
  generate: (data: Record<string, unknown>) => api.post('/roadmap/generate', data),
  getAll: () => api.get('/roadmap'),
  getOne: (id: string) => api.get(`/roadmap/${id}`),
  updateProgress: (id: string, data: Record<string, unknown>) =>
    api.put(`/roadmap/${id}/progress`, data),
};

// ---------- Dashboard ----------
export const dashboardApi = {
  get: () => api.get('/dashboard'),
  getHistory: (params?: { type?: string; page?: number; limit?: number }) =>
    api.get('/dashboard/history', { params }),
  leaderboard: () => api.get('/dashboard/leaderboard'),
  streakLeaderboard: () => api.get('/dashboard/streak-leaderboard'),
};

// ---------- Achievements ----------
export const achievementApi = {
  getAll: () => api.get('/achievements'),
  getUser: () => api.get('/achievements/user'),
};

// ---------- Notifications ----------
export const notificationApi = {
  getMine: () => api.get('/notifications'),
  markAllRead: () => api.patch('/notifications/read-all'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  dismiss: (id: string) => api.patch(`/notifications/${id}/dismiss`),
};

// ---------- Admin ----------
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getLeaderboard: (params?: Record<string, unknown>) =>
    api.get('/admin/leaderboard', { params }),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  sendNotification: (id: string, data: Record<string, unknown>) =>
    api.post(`/admin/users/${id}/notifications`, data),
  broadcastNotification: (data: Record<string, unknown>) =>
    api.post('/admin/notifications/broadcast', data),
  updateUser: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getLogs: () => api.get('/admin/logs'),
  getDailyProblems: () => api.get('/admin/daily-problems'),
  getDailyProblemPicker: (params?: Record<string, unknown>) =>
    api.get('/admin/daily-problems/picker', { params }),
  scheduleDailyProblem: (data: Record<string, unknown>) =>
    api.post('/admin/daily-problems', data),
  publishDailyProblemNow: (date: string) =>
    api.post(`/admin/daily-problems/${date}/publish`),
  deleteDailyProblem: (date: string) => api.delete(`/admin/daily-problems/${date}`),
};
