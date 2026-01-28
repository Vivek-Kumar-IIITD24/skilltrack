import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.164.253.129:8085';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
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