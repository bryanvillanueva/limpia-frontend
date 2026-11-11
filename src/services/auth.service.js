import apiClient from './apiClient';

export const loginRequest = (email, password) =>
  apiClient.post('/auth/login', { email, password });

/** The authenticated user's own profile. */
export const getMyProfile = () => apiClient.get('/auth/me').then(r => r.data);

/** Updates own basic data (nombre, apellido, telefono, direccion, tipo_visa, fecha_vencimiento_visa). */
export const updateMyProfile = (data) => apiClient.put('/auth/me', data).then(r => r.data);

/** Changes own password; the current one is required. A wrong current password answers 400. */
export const changePassword = (current_password, new_password) =>
  apiClient.put('/auth/password', { current_password, new_password }).then(r => r.data);
