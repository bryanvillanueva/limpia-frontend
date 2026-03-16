import apiClient from './apiClient';

export const getTeams = () => apiClient.get('/teams').then(r => r.data);
export const getTeamById = (id) => apiClient.get(`/teams/${id}`).then(r => r.data);
export const createTeam = (data) => apiClient.post('/teams', data).then(r => r.data);
export const updateTeam = (id, data) => apiClient.put(`/teams/${id}`, data).then(r => r.data);
export const addTeamMember = (id, userId) => apiClient.post(`/teams/${id}/members`, { user_id: userId }).then(r => r.data);
export const removeTeamMember = (id, userId) => apiClient.delete(`/teams/${id}/members/${userId}`).then(r => r.data);
export const getTeamPortfolio = (id) => apiClient.get(`/teams/${id}/portfolio`).then(r => r.data);
export const getTeamCars = (id) => apiClient.get(`/teams/${id}/cars`).then(r => r.data);
export const getTeamTools = (id) => apiClient.get(`/teams/${id}/tools`).then(r => r.data);
