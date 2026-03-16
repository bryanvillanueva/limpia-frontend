import apiClient from './apiClient';

export const getLogs = (params) => apiClient.get('/logs', { params }).then(r => r.data);
export const getLogById = (id) => apiClient.get(`/logs/${id}`).then(r => r.data);
export const getTodaySites = () => apiClient.get('/logs/today').then(r => r.data);
export const createLog = (data) => apiClient.post('/logs', data).then(r => r.data);
export const updateLog = (id, data) => apiClient.put(`/logs/${id}`, data).then(r => r.data);

/**
 * Fetches the authenticated cleaner's own daily site logs.
 * Supports optional filters: { site_id, fecha }.
 * @param {Object} [params] - Optional query filters.
 * @returns {Promise<Array>} The cleaner's logs with site/team context.
 */
export const getMyLogs = (params) => apiClient.get('/logs/my-logs', { params }).then(r => r.data);
export const getTeamLogs = (params) => apiClient.get('/logs/team', { params }).then(r => r.data);
export const deleteLog = (id) => apiClient.delete(`/logs/${id}`).then(r => r.data);

/**
 * Import logs from a teammate. Use dry_run: true for preview, false for actual import.
 * @param {Object} data - { source_user_id?, billing_week_id? | date? | fecha_inicio+fecha_fin, overwrite_existing?, dry_run? }
 */
export const importFromTeammate = (data) => apiClient.post('/logs/import-from-teammate', data).then(r => r.data);
