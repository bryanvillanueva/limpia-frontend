import apiClient from './apiClient';

/** Teammates the user can share logs with directly. */
export const getShareRecipients = () =>
  apiClient.get('/log-shares/recipients').then(r => r.data.teammates);

/**
 * Offers the user's logs for a date range to another cleaner (nothing is copied until they accept).
 * @param {{fecha_inicio: string, fecha_fin: string, recipient_id?: number, recipient_email?: string}} data
 *   Use recipient_id for a teammate, recipient_email for anyone else (other team or no team).
 */
export const createLogShare = (data) =>
  apiClient.post('/log-shares', data).then(r => r.data);

/** Recipient accepts: copies the sender's logs of the range. Returns { status, summary }. */
export const acceptLogShare = (id) =>
  apiClient.post(`/log-shares/${id}/accept`).then(r => r.data);

export const rejectLogShare = (id) =>
  apiClient.post(`/log-shares/${id}/reject`).then(r => r.data);

/** Sender withdraws a request that has not been answered. */
export const cancelLogShare = (id) =>
  apiClient.post(`/log-shares/${id}/cancel`).then(r => r.data);
