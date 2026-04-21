// src/api/notifications.js
import api from './axiosInstance.js';

export const fetchNotifications = () => api.get('/api/notifications');
export const markAsRead = (id) => api.put(`/api/notifications/${id}/read`);
export const markAllAsRead = () => api.put('/api/notifications/read-all');
