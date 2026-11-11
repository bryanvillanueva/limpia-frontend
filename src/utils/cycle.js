/**
 * Internal 4-week rotation used by the planner (cycle weeks 1..4).
 *
 * The rotation is anchored to a known Monday: the week starting on
 * CYCLE_ANCHOR_MONDAY is cycle week CYCLE_ANCHOR_WEEK. Every other week is
 * derived from it, so the app always knows which cycle week "today" is.
 *
 * If the rotation ever gets out of sync, change only these two constants.
 */
export const CYCLE_LENGTH = 4;
export const CYCLE_ANCHOR_MONDAY = new Date(2026, 10, 9); // Mon 9 Nov 2026 (month is 0-based)
export const CYCLE_ANCHOR_WEEK = 4;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Monday (00:00 local) of the week containing `date`. */
export function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Cycle week (1..4) for any date. Works for past and future dates. */
export function getCycleWeek(date = new Date()) {
  // Math.round absorbs the 1h shift of daylight-saving changes
  const diffWeeks = Math.round((mondayOf(date) - CYCLE_ANCHOR_MONDAY) / WEEK_MS);
  const idx = (((CYCLE_ANCHOR_WEEK - 1 + diffWeeks) % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
  return idx + 1;
}

/**
 * Monday that starts the 2-week report period containing `date`.
 * Reports cover cycle weeks 1+2 or weeks 3+4, so a date in week 2 or 4 belongs to the period
 * that started the Monday before (e.g. in week 4 the period began on week 3's Monday).
 */
export function getReportPeriodStart(date = new Date()) {
  const monday = mondayOf(date);
  if (getCycleWeek(monday) % 2 === 0) monday.setDate(monday.getDate() - 7);
  return monday;
}

/** True when `date` is a Monday that can start a report period (cycle week 1 or 3). */
export function isReportPeriodStart(date) {
  const d = new Date(date);
  return d.getDay() === 1 && getCycleWeek(d) % 2 === 1;
}
