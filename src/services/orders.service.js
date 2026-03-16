import apiClient from './apiClient';

export const getOrders = () => apiClient.get('/supply-orders').then(r => r.data);
export const getMyOrders = () => apiClient.get('/supply-orders/my-team').then(r => r.data);
export const getOrderById = (id) => apiClient.get(`/supply-orders/${id}`).then(r => r.data);
export const createOrder = (data) => apiClient.post('/supply-orders', data).then(r => r.data);
export const approveOrder = (id) => apiClient.put(`/supply-orders/${id}/approve`).then(r => r.data);
export const completeOrder = (id) => apiClient.put(`/supply-orders/${id}/complete`).then(r => r.data);
export const rejectOrder = (id, motivo) => apiClient.put(`/supply-orders/${id}/reject`, { motivo }).then(r => r.data);
