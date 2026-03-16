import apiClient from './apiClient';

/**
 * Returns the authenticated user's active team from user_team_history.
 * Used by cleaners to auto-detect their team without needing the teams dropdown.
 * @returns {{ team_id: number, team_numero: string }}
 */
export const getMyTeam = () =>
  apiClient.get('/planner/my-team').then(r => r.data);

/**
 * Fetches the full planner grid for a team and cycle week.
 * @param {number} teamId - Team ID.
 * @param {number} cycleWeek - Cycle week (1–4).
 * @returns {{ plans: Array, day_totals: Object }} Grid data with plans and day totals.
 */
export const getWeekPlan = (teamId, cycleWeek) =>
  apiClient.get(`/planner/${teamId}/${cycleWeek}`).then(r => r.data);

/**
 * Fetches available sites for a team from active assignments.
 * Used to populate the "Add Item" dropdown.
 * @param {number} teamId - Team ID.
 * @returns {Array} List of site objects with assignment details (horas_por_trabajador, hace_bins, pago_bins, etc.).
 */
export const getTeamSites = (teamId) =>
  apiClient.get(`/planner/${teamId}/sites`).then(r => r.data);

/**
 * Creates or updates a planner item (upserts plan header + item).
 * Backend calculates display_value from team_site_assignments.
 * @param {{ team_id: number, site_id: number, cycle_week: number, day_of_week: number, entry_type: string, item_comment?: string }} data
 * @returns {{ message: string, plan_id: number, item_id: number, entry_type: string, display_value: number }}
 */
export const createItem = (data) =>
  apiClient.post('/planner/item', data).then(r => r.data);

/**
 * Updates a plan header (week_comment and/or active status).
 * @param {number} planId - Plan ID.
 * @param {{ week_comment?: string, active?: boolean }} data - Fields to update.
 * @returns {{ message: string }}
 */
export const updatePlan = (planId, data) =>
  apiClient.patch(`/planner/plan/${planId}`, data).then(r => r.data);

/**
 * Updates a planner item (entry_type and/or item_comment).
 * @param {number} itemId - Item ID.
 * @param {{ entry_type?: string, item_comment?: string|null }} data - Fields to update.
 * @returns {{ message: string }}
 */
export const updateItem = (itemId, data) =>
  apiClient.patch(`/planner/item/${itemId}`, data).then(r => r.data);

/**
 * Deletes a planner item. Auto-cleans parent plan if no items remain.
 * @param {number} itemId - Item ID.
 * @returns {{ message: string }}
 */
export const deleteItem = (itemId) =>
  apiClient.delete(`/planner/item/${itemId}`).then(r => r.data);
