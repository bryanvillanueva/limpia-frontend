import apiClient from './apiClient';

export const getAllVacations = () => apiClient.get('/vacations').then(r => r.data);
export const getMyVacations = () => apiClient.get('/vacations/mine').then(r => r.data);
export const createVacation = (data) => apiClient.post('/vacations', data).then(r => r.data);
export const approveVacation = (id, reemplazo_user_id) => apiClient.put(`/vacations/${id}/approve`, { reemplazo_user_id }).then(r => r.data);
export const rejectVacation = (id, motivo) => apiClient.put(`/vacations/${id}/reject`, { motivo }).then(r => r.data);
