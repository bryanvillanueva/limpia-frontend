import apiClient from './apiClient';

export const getReports = () => apiClient.get('/reports').then(r => r.data);
export const getReportById = (id) => apiClient.get(`/reports/${id}`).then(r => r.data);
export const generateReport = (data) => apiClient.post('/reports/generate', data).then(r => r.data);
export const updateReportStatus = (id, data) => apiClient.put(`/reports/${id}/status`, data).then(r => r.data);
export const getCycle = (date) => apiClient.get('/reports/cycle', { params: date ? { date } : undefined }).then(r => r.data);
export const getPeriodLogs = (params) => apiClient.get('/reports/period-logs', { params }).then(r => r.data);
export const getMyReports = () => apiClient.get('/reports/my-reports').then(r => r.data);

export const exportExcel = (id) =>
  apiClient.get(`/reports/${id}/export-excel`, { responseType: 'blob' }).then(r => {
    const url = window.URL.createObjectURL(r.data);
    const a = document.createElement('a');
    a.href = url;
    const disposition = r.headers['content-disposition'];
    a.download = disposition?.match(/filename="?([^"]+)"?/)?.[1]?.trim() || `reporte_${id}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  });
