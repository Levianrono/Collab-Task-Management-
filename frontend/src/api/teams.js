// src/api/teams.js
import api from './axiosInstance.js';

export const fetchMyTeams = () => {
  if (import.meta.env.VITE_DEV_BYPASS === 'true') {
    return Promise.resolve({ data: { teams: [{ team: { id: 't1', name: 'Product Engineering' }, role: 'admin' }] } });
  }
  return api.get('/api/teams');
};
export const createTeam = (data) => api.post('/api/teams', data);
export const fetchMembers = (teamId) => api.get(`/api/teams/${teamId}/members`);
export const inviteMember = (teamId, data) => api.post(`/api/teams/${teamId}/invite`, data);
export const updateMemberRole = (teamId, userId, data) => api.put(`/api/teams/${teamId}/members/${userId}`, data);
export const removeMember = (teamId, userId) => api.delete(`/api/teams/${teamId}/members/${userId}`);
