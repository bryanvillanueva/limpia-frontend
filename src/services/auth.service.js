import apiClient from './apiClient';

export const loginRequest = (email, password) =>
  apiClient.post('/auth/login', { email, password });
