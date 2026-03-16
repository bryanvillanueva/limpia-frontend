import apiClient from './apiClient';

export const getSites = () => apiClient.get('/sites').then(r => r.data);

/**
 * Fetches sites assigned to the authenticated user's team.
 * Uses the /sites/my-sites endpoint which looks up the user's active team
 * and returns their assigned sites with assignment + client info.
 * @returns {Promise<Array>} Sites with assignment details (frecuencia, horas_por_trabajador, etc.)
 */
export const getMySites = () => apiClient.get('/sites/my-sites').then(r => r.data);
export const getSiteById = (id) => apiClient.get(`/sites/${id}`).then(r => r.data);
export const createSite = (data) => apiClient.post('/sites', data).then(r => r.data);
export const updateSite = (id, data) => apiClient.put(`/sites/${id}`, data).then(r => r.data);
export const deactivateSite = (id) => apiClient.delete(`/sites/${id}`).then(r => r.data);
export const assignTeamToSite = (id, data) => apiClient.post(`/sites/${id}/assign`, data).then(r => r.data);
export const removeTeamFromSite = (siteId, teamId) => apiClient.delete(`/sites/${siteId}/assign/${teamId}`).then(r => r.data);
export const getSiteAssignments = (id) => apiClient.get(`/sites/${id}/assignments`).then(r => r.data);
export const getSiteComments = (id) => apiClient.get(`/sites/${id}/comments`).then(r => r.data);
export const addSiteComment = (id, comentario) => apiClient.post(`/sites/${id}/comments`, { comentario }).then(r => r.data);
export const getSiteLogs = (id) => apiClient.get(`/sites/${id}/logs`).then(r => r.data);

/**
 * Importa sitios desde un archivo CSV o XLSX.
 * Matching by direccion_linea1 + cliente_id: same data → update assignment only,
 * different data → new site, no match → insert.
 * @param {File} file - Archivo CSV o XLSX a importar.
 * @returns {Promise<{message: string, imported: number, updated: number, failed: number, errors: Array<{row: number, message: string}>}>}
 */
export const importSites = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/sites/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};
