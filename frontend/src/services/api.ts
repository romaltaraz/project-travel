import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login only if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

// Helper to build image URL from imageFileName
export const getImageUrl = (fileName: string): string => {
  const base = BASE.replace('/api', '');
  return `${base}/uploads/${fileName}`;
};

export default api;
