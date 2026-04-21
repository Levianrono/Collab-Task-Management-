// src/api/tasks.js
import api from './axiosInstance.js';

export const fetchTasks = (params) => api.get('/api/tasks', { params });
export const fetchTaskById = (id) => api.get(`/api/tasks/${id}`);
export const createTask = (data) => api.post('/api/tasks', data);
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);

// Comments nested under tasks
export const fetchComments = (taskId, params) => api.get(`/api/tasks/${taskId}/comments`, { params });
export const addComment = (taskId, data) => api.post(`/api/tasks/${taskId}/comments`, data);
export const deleteComment = (commentId) => api.delete(`/api/comments/${commentId}`);
