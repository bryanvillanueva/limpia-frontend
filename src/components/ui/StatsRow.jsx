import { Grid, Paper, Box, Skeleton } from '@mui/material';
import StatCard from './StatCard';

/**
 * Row of summary cards that always fills the width evenly:
 * 4+ cards -> 4 per row, 3 -> thirds, 2 -> halves. On phones two per row,
 * and an odd last card takes the full width (no orphan half-row).
 * While `loading`, shows skeleton cards of the same size so numbers don't flash as 0.
 *
 * @param {Array<object>} items - StatCard props: { icon, label, value, tone, highlight, subtitle, onClick }.
 * @param {boolean} [loading]   - Show skeletons instead of the cards.
 */
export default function StatsRow({ items, loading = false }) {
  const visible = items.filter(Boolean);
  const n = visible.length;
  if (n === 0) return null;
  const md = n >= 4 ? 3 : Math.floor(12 / n);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {visible.map((item, i) => (
        <Grid key={item.label} size={{ xs: n % 2 === 1 && i === n - 1 ? 12 : 6, md }}>
          {loading ? (
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="rounded" width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width={50} height={30} />
                  <Skeleton width="80%" height={16} />
                </Box>
              </Box>
            </Paper>
          ) : (
            <StatCard {...item} />
          )}
        </Grid>
      ))}
    </Grid>
  );
}
