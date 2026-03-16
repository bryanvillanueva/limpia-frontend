import { useMemo } from 'react';
import WeekColumnGrid from '../../components/ui/WeekColumnGrid';

/**
 * Builds columnData from plans array: { [dayNum]: Array<{ plan, items }> }
 * Each plan can appear in multiple days (one entry per day it has items for).
 * Preserves creation order (plans are already ordered by p.id from backend).
 */
function buildColumnData(plans) {
  const columns = {};
  for (let d = 1; d <= 7; d++) columns[d] = [];

  for (const plan of plans) {
    const byDay = {};
    for (const item of plan.items || []) {
      const d = item.day_of_week;
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(item);
    }

    for (const [day, items] of Object.entries(byDay)) {
      columns[Number(day)].push({ plan, items });
    }
  }

  // Sort each day's entries by the earliest item_id in that day,
  // so order reflects when items were added to each specific day
  for (let d = 1; d <= 7; d++) {
    columns[d].sort((a, b) => {
      const minA = Math.min(...a.items.map(i => i.item_id));
      const minB = Math.min(...b.items.map(i => i.item_id));
      return minA - minB;
    });
  }

  return columns;
}

/**
 * Planner grid wrapper — transforms plans into column-per-day layout
 * and delegates rendering to WeekColumnGrid.
 *
 * @param {Array}    plans        - Plan objects with nested items.
 * @param {Object}   dayTotals    - { [day_of_week]: totalValue }.
 * @param {boolean}  loading      - Show skeleton placeholders.
 * @param {Function} onDeleteItem - Called with item object on delete.
 * @param {Function} onAddItem    - Called with { planId, siteId, dayOfWeek } to open add modal.
 * @param {Function} onEditPlan   - Called with plan object to edit comment.
 * @param {Function} onColorChange - Called with (plan, color) for inline color changes.
 */
export default function PlannerGrid({ plans, dayTotals, loading, onDeleteItem, onAddItem, onEditPlan, onColorChange }) {
  const columnData = useMemo(() => buildColumnData(plans || []), [plans]);

  const handleEntryClick = (plan, dayItems) => {
    onEditPlan?.(plan, dayItems);
  };

  return (
    <WeekColumnGrid
      columnData={columnData}
      dayTotals={dayTotals}
      loading={loading}
      editable
      onEntryClick={handleEntryClick}
      onDeleteItem={onDeleteItem}
      onColorChange={onColorChange}
      onAddItem={onAddItem}
    />
  );
}
