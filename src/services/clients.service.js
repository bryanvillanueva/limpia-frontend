import apiClient from './apiClient';

export const getClients = () => apiClient.get('/clients').then(r => r.data);
export const getClientById = (id) => apiClient.get(`/clients/${id}`).then(r => r.data);
export const createClient = (data) => apiClient.post('/clients', data).then(r => r.data);
export const updateClient = (id, data) => apiClient.put(`/clients/${id}`, data).then(r => r.data);
