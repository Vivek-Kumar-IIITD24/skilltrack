import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ✅ Pointing to your LIVE Render Backend
const API_URL = 'https://skilltrack-backend-qlr5.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor: Add Token to every request automatically
api.interceptors.request.use(
  async (config) => {
    try {
      // On mobile, we use SecureStore instead of localStorage
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;