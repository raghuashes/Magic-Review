import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to outgoing protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized responses to trigger clean re-auth
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Don't auto redirect on login/register endpoints themselves
      if (!error.config?.url?.includes('/api/auth/login') && !error.config?.url?.includes('/api/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      if ('message' in data && typeof data.message === 'string') {
        return data.message;
      }
      if ('errors' in data && typeof data.errors === 'object') {
        const fieldErrors = Object.values(data.errors as Record<string, string>);
        if (fieldErrors.length > 0) return fieldErrors.join(', ');
      }
    }
    return error.message || 'An error occurred while contacting the server';
  }
  return error instanceof Error ? error.message : 'Unknown error';
}

export default api;
