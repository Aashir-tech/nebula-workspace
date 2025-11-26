import axios from 'axios';

const API_URL = ((import.meta as any).env.VITE_API_URL || 'http://localhost:8299').replace(/\/$/, '');

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
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name: string }) => api.patch('/auth/me', data),
  deleteAccount: () => api.delete('/auth/me'),
};

export const taskAPI = {
  getTasks: (workspaceId: string) =>
    api.get('/tasks', { params: { workspaceId } }),
  createTask: (data: any) => api.post('/tasks', data),
  updateTask: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`)
};

export const workspaceAPI = {
  getAll: () => api.get('/workspaces'),
  create: (data: { name: string; type: string }) => api.post('/workspaces', data),
  update: (id: string, data: { name: string }) => api.put(`/workspaces/${id}`, data),
  deleteWorkspace: (id: string) => api.delete(`/workspaces/${id}`),
  leaveWorkspace: (id: string) => api.post(`/workspaces/${id}/leave`),
  join: (inviteCode: string) => api.post('/workspaces/join', { inviteCode }),
  getMembers: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/members`),
  createInvitation: (data: { workspaceId: string; inviteeEmail: string; role?: string }) => 
    api.post('/invitations', data),
  addMember: (workspaceId: string, data: { email: string; role: string }) => 
    api.post(`/workspaces/${workspaceId}/members`, data),
  removeMember: (workspaceId: string, userId: string) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}`)
};

export const aiAPI = {
  enhanceText: (data: { text: string; mode: string }) => api.post('/ai/enhance', data),
  generateInsights: (workspaceId: string) => api.post('/ai/insights', { workspaceId }),
  generateStandup: (data: { userId: string; workspaceId: string }) => api.post('/ai/standup', data),
};

export const leaderboardAPI = {
  getLeaderboard: (workspaceId: string) => api.get(`/leaderboard/${workspaceId}`),
};

export const invitationAPI = {
  create: (data: { workspaceId: string; inviteeEmail: string; role?: string }) => 
    api.post('/invitations', data),
  getMyInvitations: () => api.get('/invitations/my'),
  accept: (id: string) => api.post(`/invitations/${id}/accept`),
  reject: (id: string) => api.post(`/invitations/${id}/reject`)
};

export const commentAPI = {
  getComments: (taskId: string) => api.get(`/tasks/${taskId}/comments`),
  createComment: (data: { taskId: string; content: string }) => api.post('/comments', data),
  updateComment: (id: string, data: { content: string }) => api.patch(`/comments/${id}`, data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`)
};
