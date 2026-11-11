import apiClient from './apiClient';

/** Lightweight count for the bell badge (meant to be polled). */
export const getUnreadCount = () =>
  apiClient.get('/notifications/unread-count').then(r => r.data.unread_count);

/**
 * Lists the user's notifications, newest first.
 * @param {{limit?: number, unread?: boolean}} [params]
 * @returns {Promise<{unread_count: number, notifications: Array}>}
 */
export const getNotifications = ({ limit = 30, unread = false } = {}) =>
  apiClient
    .get('/notifications', { params: { limit, ...(unread ? { unread: 1 } : {}) } })
    .then(r => r.data);

export const markNotificationRead = (id) =>
  apiClient.patch(`/notifications/${id}/read`).then(r => r.data);

export const markAllNotificationsRead = () =>
  apiClient.post('/notifications/read-all').then(r => r.data);
