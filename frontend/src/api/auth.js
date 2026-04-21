// src/api/auth.js
import api from './axiosInstance.js';

export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);
export const logoutUser = () => api.post('/api/auth/logout');
export const getMe = () => api.get('/api/auth/me');
export const googleLogin = () => { window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`; };
