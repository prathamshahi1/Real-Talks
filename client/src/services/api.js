import axios from 'axios';

/**
 * Pre-configured Axios instance for REST API calls
 * Sets base URL and enables credentials (cookies) for all requests
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
