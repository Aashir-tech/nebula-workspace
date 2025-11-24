import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8299';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nebula_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('nebula_token');
      localStorage.removeItem('nebula_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const taskAPI = {
  getTasks: (workspaceId: string) =>
    api.get('/tasks', { params: { workspaceId } }),
  createTask: (data: any) => api.post('/tasks', data),
  updateTask: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`)
};

export const workspaceAPI = {
  getWorkspaces: () => api.get('/workspaces'),
  createWorkspace: (data: { name: string; type: string }) =>
    api.post('/workspaces', data),
  joinWorkspace: (inviteCode: string) =>
    api.post('/workspaces/join', { inviteCode })
};

export const aiAPI = {
  enhanceText: (data: { text: string; mode: string }) => api.post('/ai/enhance', data),
  generateInsights: (workspaceId: string) => api.post('/ai/insights', { workspaceId }),
  generateStandup: (data: { userId: string; workspaceId: string }) => api.post('/ai/standup', data),
};

export const leaderboardAPI = {
  getLeaderboard: (workspaceId: string) => api.get(`/leaderboard/${workspaceId}`),
};
