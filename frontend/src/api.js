import axios from 'axios';

// Automatically uses deployed backend in production, or fallback to the provided URL
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  }
});

// Request interceptor to attach JWT auth token for Admin routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to format errors consistently
api.interceptors.response.use(
  (response) => {
    // Only return the extracted standard data structure
    return response.data;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
      return Promise.reject(new Error('Session expired'));
    }

    // Transform backend errors to strings consistently
    let errorMessage = 'An absolute network failure occurred.';
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
