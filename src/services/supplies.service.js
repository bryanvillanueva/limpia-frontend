import apiClient from './apiClient';

export const getSupplies = () => apiClient.get('/supplies').then(r => r.data);
export const createSupply = (data) => apiClient.post('/supplies', data).then(r => r.data);
export const updateSupply = (id, data) => apiClient.put(`/supplies/${id}`, data).then(r => r.data);

/**
 * Uploads a supply image to Cloudinary via the backend.
 * The backend handles the Cloudinary upload and returns the hosted URL.
 *
 * @param {File} file - Image file from an <input type="file">.
 * @returns {Promise<{ imagen_url: string }>} The Cloudinary secure URL.
 */
export const uploadSupplyImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  return apiClient.post('/supplies/upload-image', form).then(r => r.data);
};
