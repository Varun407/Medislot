import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly session cookie
  headers: {
    'Content-Type': 'application/json'
  }
});

// Also support Authorization Bearer token from localStorage if cookie is blocked (fallback)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('medislot_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If session expired or unauthorized on protected routes
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('medislot_token');
      }
    }
    return Promise.reject(error);
  }
);
