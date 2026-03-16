import apiClient from './apiClient';

export const getComplaints = () => apiClient.get('/complaints').then(r => r.data);
export const getComplaintById = (id) => apiClient.get(`/complaints/${id}`).then(r => r.data);
export const createComplaint = (data) => apiClient.post('/complaints', data).then(r => r.data);
export const updateComplaint = (id, data) => apiClient.put(`/complaints/${id}`, data).then(r => r.data);
