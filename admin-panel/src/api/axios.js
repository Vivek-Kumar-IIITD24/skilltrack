import axios from 'axios';

// ✅ Connects to your existing Spring Boot Backend
const api = axios.create({
    baseURL: 'http://localhost:8085/api', // Your Java Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically add the Token if we are logged in
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // We will save the token here later
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;