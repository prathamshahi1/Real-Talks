import axios from 'axios';

/**
 * Pre-configured Axios instance for REST API calls
 * Sets base URL and enables credentials (cookies) + Bearer token header
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage as Authorization Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('real_talks_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
