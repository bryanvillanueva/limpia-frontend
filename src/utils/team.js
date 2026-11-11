/**
 * True when an API error means "this user has no active team" (not a real failure).
 * Endpoints answer 404 (planner / my-team) or 400 (supply orders) with a message that mentions the team.
 */
export function isNoTeamError(err) {
  const status = err?.response?.status;
  const message = err?.response?.data?.message || '';
  return (status === 404 || status === 400) && /equipo/i.test(message);
}
