// Pure helpers for the "Registrar Logs" week grid (kept apart from the components for react-refresh).
import { formatHours } from '../../utils/format';

/** Service type = color + label. The state (planned / registered) is shown with an icon, never only with color. */
export const TYPE_META = {
  SERVICE: { label: 'Service', tone: 'success' },
  BINS:    { label: 'Bins', tone: 'info' },
  CUSTOM:  { label: 'Otro', tone: 'warning' },
};

const TYPE_ORDER = ['SERVICE', 'BINS', 'CUSTOM'];

export const typeOf = (entryType) => (TYPE_META[entryType] ? entryType : 'SERVICE');
export const typeMeta = (entryType) => TYPE_META[typeOf(entryType)];

/** 1.25 -> "1.25 h", 2 -> "2 h" */
export const hoursLabel = formatHours;

/**
 * One entry per service in a cell. A planned service and its log are the SAME entry in two states:
 * once registered, the planned card turns into the registered one (it does not show twice).
 * Each log covers at most one planned item of its type; extra logs are extra entries.
 *
 * @returns {Array<{key: string, state: 'planned'|'logged', type: string, log?: Object, item?: Object}>}
 */
export function cellEntries(plannerItems = [], cellLogs = []) {
  const remaining = [...cellLogs];
  const entries = [];
  for (const item of plannerItems) {
    const type = typeOf(item.entry_type);
    const idx = remaining.findIndex((l) => typeOf(l.entry_type) === type);
    if (idx >= 0) {
      const [log] = remaining.splice(idx, 1);
      entries.push({ key: `log-${log.id}`, state: 'logged', type, log });
    } else {
      entries.push({ key: `plan-${item.item_id}`, state: 'planned', type, item });
    }
  }
  for (const log of remaining) entries.push({ key: `log-${log.id}`, state: 'logged', type: typeOf(log.entry_type), log });
  return entries.sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));
}
