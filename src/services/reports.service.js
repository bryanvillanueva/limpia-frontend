import apiClient from './apiClient';

export const getReports = () => apiClient.get('/reports').then(r => r.data);
export const getReportById = (id) => apiClient.get(`/reports/${id}`).then(r => r.data);
export const generateReport = (data) => apiClient.post('/reports/generate', data).then(r => r.data);
export const approveReport = (id) => apiClient.put(`/reports/${id}/approve`).then(r => r.data);
export const getCycle = (date) => apiClient.get('/reports/cycle', { params: date ? { date } : undefined }).then(r => r.data);
export const getPeriodLogs = (params) => apiClient.get('/reports/period-logs', { params }).then(r => r.data);
export const getMyReports = () => apiClient.get('/reports/my-reports').then(r => r.data);
