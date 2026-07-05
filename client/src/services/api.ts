import axios from 'axios';



const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});



let refreshPromise: Promise<string | null> | null = null;



export function isTokenExpired(token: string, bufferSeconds = 60): boolean {

  try {

    const payload = JSON.parse(atob(token.split('.')[1]));

    if (!payload.exp) return false;

    return payload.exp * 1000 < Date.now() + bufferSeconds * 1000;

  } catch {

    return true;

  }

}



export async function refreshAccessToken(): Promise<string | null> {

  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) return null;



  if (!refreshPromise) {

    refreshPromise = api

      .post('/auth/refresh', { refreshToken })

      .then(({ data }) => {

        localStorage.setItem('accessToken', data.data.accessToken);

        localStorage.setItem('refreshToken', data.data.refreshToken);

        return data.data.accessToken as string;

      })

      .catch(() => {

        localStorage.removeItem('accessToken');

        localStorage.removeItem('refreshToken');

        return null;

      })

      .finally(() => {

        refreshPromise = null;

      });

  }



  return refreshPromise;

}



api.interceptors.request.use((config) => {

  const token = localStorage.getItem('accessToken');

  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {

    delete config.headers['Content-Type'];

  }

  return config;

});



api.interceptors.response.use(

  (res) => res,

  async (error) => {

    const original = error.config;

    const isAuthRoute = original?.url?.includes('/auth/login')

      || original?.url?.includes('/auth/register')

      || original?.url?.includes('/auth/refresh');



    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {

      original._retry = true;

      const newToken = await refreshAccessToken();

      if (newToken) {

        original.headers.Authorization = `Bearer ${newToken}`;

        return api(original);

      }

      if (!window.location.pathname.startsWith('/login')) {

        window.location.href = '/login';

      }

    }

    return Promise.reject(error);

  }

);



export default api;



// Auth

export const authApi = {

  register: (data: { name: string; email: string; password: string }) =>

    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) => api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),

};



export const publicApi = {

  getStats: () => api.get('/public/stats'),

};



// Users

export const userApi = {

  updateProfile: (data: object) => api.put('/users/profile', data),

  uploadAvatar: (file: File) => {

    const form = new FormData();

    form.append('avatar', file);

    return api.post('/users/avatar', form);

  },

  updateSettings: (data: object) => api.put('/users/settings', data),

};



// Resume

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



// Skill Gap

export const skillGapApi = {

  analyze: (data: object) => api.post('/skill-gap/analyze', data),

  getAll: () => api.get('/skill-gap'),

  getOne: (id: string) => api.get(`/skill-gap/${id}`),

  updateProgress: (id: string, data: object) => api.put(`/skill-gap/${id}/progress`, data),

};



// Interviews

export const interviewApi = {

  start: (data: object) => api.post('/interviews/start', data),

  answer: (id: string, data: object) => api.post(`/interviews/${id}/answer`, data),

  followUp: (id: string, data?: object) => api.post(`/interviews/${id}/follow-up`, data),

  complete: (id: string, data?: object) => api.post(`/interviews/${id}/complete`, data),

  analyzeVoice: (data: object) => api.post('/interviews/voice/analyze', data),

  getAll: () => api.get('/interviews'),

  getOne: (id: string) => api.get(`/interviews/${id}`),

  getWelcome: (id: string) => api.get(`/interviews/${id}/welcome`),

  voiceTurn: (id: string, data: object) => api.post(`/interviews/${id}/voice-turn`, data),

};



// Coding

export const codingApi = {

  getTopics: () => api.get('/coding/topics'),

  getProblems: (params?: object) => api.get('/coding/problems', { params }),

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

  start: (data: object) => api.post('/coding/start', data),

  run: (id: string, data: object) => api.post(`/coding/${id}/run`, data),

  submit: (id: string, data: object) => api.post(`/coding/${id}/submit`, data),

  getAll: () => api.get('/coding'),

  getOne: (id: string) => api.get(`/coding/${id}`),

};



// Career

export const careerApi = {

  predict: (data: object) => api.post('/career/predict', data),

  getAll: () => api.get('/career'),

  getOne: (id: string) => api.get(`/career/${id}`),

};



// Roadmap

export const roadmapApi = {

  generate: (data: object) => api.post('/roadmap/generate', data),

  getAll: () => api.get('/roadmap'),

  getOne: (id: string) => api.get(`/roadmap/${id}`),

  updateProgress: (id: string, data: object) => api.put(`/roadmap/${id}/progress`, data),

};



// Dashboard

export const dashboardApi = {

  get: () => api.get('/dashboard'),

  getHistory: (params?: { type?: string; page?: number; limit?: number }) =>

    api.get('/dashboard/history', { params }),

  leaderboard: () => api.get('/dashboard/leaderboard'),

  streakLeaderboard: () => api.get('/dashboard/streak-leaderboard'),

};



// Achievements

export const achievementApi = {

  getAll: () => api.get('/achievements'),

  getUser: () => api.get('/achievements/user'),

};



// Notifications

export const notificationApi = {

  getMine: () => api.get('/notifications'),

  markAllRead: () => api.patch('/notifications/read-all'),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`),

  dismiss: (id: string) => api.patch(`/notifications/${id}/dismiss`),

};



// Admin

export const adminApi = {

  getStats: () => api.get('/admin/stats'),

  getLeaderboard: (params?: object) => api.get('/admin/leaderboard', { params }),

  getUsers: (params?: object) => api.get('/admin/users', { params }),

  getUser: (id: string) => api.get(`/admin/users/${id}`),

  sendNotification: (id: string, data: object) => api.post(`/admin/users/${id}/notifications`, data),

  broadcastNotification: (data: object) => api.post('/admin/notifications/broadcast', data),

  updateUser: (id: string, data: object) => api.put(`/admin/users/${id}`, data),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  getLogs: () => api.get('/admin/logs'),

  getDailyProblems: () => api.get('/admin/daily-problems'),

  getDailyProblemPicker: (params?: object) => api.get('/admin/daily-problems/picker', { params }),

  scheduleDailyProblem: (data: object) => api.post('/admin/daily-problems', data),

  publishDailyProblemNow: (date: string) => api.post(`/admin/daily-problems/${date}/publish`),

  deleteDailyProblem: (date: string) => api.delete(`/admin/daily-problems/${date}`),

};


