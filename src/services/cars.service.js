import apiClient from './apiClient';

/**
 * Fetches all cars from the API.
 * @returns {Promise<Array>} List of car objects.
 */
export const getCars = () => apiClient.get('/cars').then(r => r.data);

/**
 * Fetches a single car by ID.
 * @param {number} id - Car ID.
 * @returns {Promise<Object>} Car object with full details.
 */
export const getCarById = (id) => apiClient.get(`/cars/${id}`).then(r => r.data);

/**
 * Creates a new car record.
 * @param {Object} data - Car fields (matricula, tipo, marca, modelo, version, etc.).
 * @returns {Promise<Object>} Created car response.
 */
export const createCar = (data) => apiClient.post('/cars', data).then(r => r.data);

/**
 * Updates an existing car record.
 * @param {number} id - Car ID.
 * @param {Object} data - Updated car fields.
 * @returns {Promise<Object>} Updated car response.
 */
export const updateCar = (id, data) => apiClient.put(`/cars/${id}`, data).then(r => r.data);

/**
 * Fetches the service history for a specific car.
 * @param {number} carId - Car ID.
 * @returns {Promise<Array>} List of car_services records.
 */
export const getCarServices = (carId) =>
  apiClient.get(`/cars/${carId}/services`).then(r => r.data);

/**
 * Creates a new service record for a car.
 * Snapshot fields (car_matricula, car_tipo, etc.) are generated server-side.
 * @param {number} carId - Car ID.
 * @param {Object} data - Service fields (fecha_mantenimiento, km_mantenimiento, precio, notas).
 * @returns {Promise<Object>} Created service response.
 */
export const createCarService = (carId, data) =>
  apiClient.post(`/cars/${carId}/services`, data).then(r => r.data);
