import apiClient from './apiClient';

export const getTools = () => apiClient.get('/tools').then(r => r.data);
export const getToolById = (id) => apiClient.get(`/tools/${id}`).then(r => r.data);
export const createTool = (data) => apiClient.post('/tools', data).then(r => r.data);
export const updateTool = (id, data) => apiClient.put(`/tools/${id}`, data).then(r => r.data);
export const deleteTool = (id) => apiClient.delete(`/tools/${id}`).then(r => r.data);

/**
 * Importa herramientas desde un archivo CSV o XLSX.
 * @param {File} file - Archivo CSV o XLSX a importar.
 * @returns {Promise<{message: string, imported: number, failed: number, errors: Array<{row: number, message: string}>}>}
 */
export const importTools = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/tools/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};
