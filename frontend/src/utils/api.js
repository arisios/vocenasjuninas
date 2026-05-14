import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';
export const UPLOADS_URL = BASE.replace('/api', '/uploads');

const api = axios.create({ baseURL: BASE, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vnj_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vnj_token');
      localStorage.removeItem('vnj_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
