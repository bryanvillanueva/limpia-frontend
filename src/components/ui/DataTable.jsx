import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Skeleton, Stack, Box, useMediaQuery, useTheme,
} from '@mui/material';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  rows,
  loading,
  keyField = 'id',
  emptyMessage = 'No hay datos',
  onRowClick,
  mobileCardRender,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile && mobileCardRender) {
    return (
      <Stack spacing={1.5}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))
        ) : rows.length === 0 ? (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <EmptyState message={emptyMessage} />
          </Box>
        ) : (
          rows.map(row => (
            <Box
              key={row[keyField]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                p: 1.5,
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick ? { borderColor: 'primary.main' } : undefined,
              }}
            >
              {mobileCardRender(row)}
            </Box>
          ))
        )}
      </Stack>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', overflow: 'auto' }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(col => (
              <TableCell key={col.field} align={col.align}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map(col => (
                  <TableCell key={col.field}>
                    <Skeleton variant="rounded" height={20} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ p: 0, border: 0 }}>
                <EmptyState message={emptyMessage} />
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => (
              <TableRow
                key={row[keyField]}
                hover={!!onRowClick}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map(col => (
                  <TableCell key={col.field} align={col.align}>
                    {col.render ? col.render(row) : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
