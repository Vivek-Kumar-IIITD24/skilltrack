import axios from 'axios';

// 1. Create the Axios instance pointing to your Java Backend
const api = axios.create({
  baseURL: 'https://skilltrack-backend-qlr5.onrender.com', // Your Spring Boot URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add an "Interceptor" to attach the Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get token from browser storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;