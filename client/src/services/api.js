import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const loginApi    = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);
export const getMeApi    = ()     => api.get('/auth/me');

// ── Admin ─────────────────────────────────────────────
export const getAdminStats       = ()          => api.get('/admin/stats');
export const getAdminUsers       = (role)      => api.get('/admin/users', { params: { role } });
export const createAdminUser     = (data)      => api.post('/admin/users', data);
export const deleteAdminUser     = (id)        => api.delete(`/admin/users/${id}`);
export const toggleUserStatus    = (id)        => api.patch(`/admin/users/${id}/toggle`);
export const getAdminSubjects    = ()          => api.get('/admin/subjects');
export const createAdminSubject  = (data)      => api.post('/admin/subjects', data);
export const updateAdminSubject  = (id, data)  => api.put(`/admin/subjects/${id}`, data);
export const deleteAdminSubject  = (id)        => api.delete(`/admin/subjects/${id}`);
export const getAdminFeedback    = ()          => api.get('/admin/feedback');
export const deleteAdminFeedback = (id, data)  => api.delete(`/admin/feedback/${id}`, { data });

// ── Student ───────────────────────────────────────────
export const getStudentSubjects  = ()     => api.get('/student/subjects');
export const submitFeedback      = (data) => api.post('/student/feedback', data);
export const getMyFeedback       = ()     => api.get('/student/feedback/mine');

// ── Faculty ───────────────────────────────────────────
export const getFacultySubjects  = ()          => api.get('/faculty/subjects');
export const getFacultyFeedback  = (subjectId) => api.get('/faculty/feedback', { params: { subject: subjectId } });
export const getFacultyAnalytics = ()          => api.get('/faculty/analytics');
export const getFacultyStats     = ()          => api.get('/faculty/stats');

export default api;
