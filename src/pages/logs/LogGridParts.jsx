import { Box, Typography, ButtonBase, Tooltip, alpha } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { CheckCircleOutline, Schedule, Add, StickyNote2Outlined } from '@mui/icons-material';
import { typeMeta, hoursLabel } from './logGrid';

// Brief pulse on a log that was just created or edited, so the user sees where it landed
const flashPulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(38, 97, 79, 0.55); }
  100% { box-shadow: 0 0 0 10px rgba(38, 97, 79, 0); }
`;

// Pointer devices reveal the "+" on hover/focus; touch screens keep it visible but discreet
const HOVER = '@media (hover: hover)';

/**
 * The same card for a service whether it is only planned or already registered:
 * the TYPE is the color + label, the STATE is the icon + text on the second line
 * (clock + "Planificado" / check + hours), so it still reads in grayscale.
 *
 * @param {Object}   entry    - From cellEntries(): { state, type, log?, item? }.
 * @param {string}   siteName - For the accessible name / tooltip.
 * @param {string}   dayName  - For the accessible name / tooltip.
 * @param {Function} onClick  - Registered: edit the log. Planned: register it.
 * @param {boolean}  [flash]  - Highlight a log that just changed.
 */
export function EntryCard({ entry, siteName, dayName, onClick, flash = false }) {
  const meta = typeMeta(entry.type);
  const logged = entry.state === 'logged';
  const note = logged ? entry.log.observaciones : null;
  const value = logged ? hoursLabel(entry.log.display_value) : null;
  const action = logged ? `Editar ${meta.label} ${value}` : `Registrar ${meta.label} planificado`;

  return (
    <Tooltip
      arrow
      enterDelay={400}
      title={`${action} · ${siteName}, ${dayName}${note ? ` · «${note}»` : ''}`}
    >
      <ButtonBase
        onClick={onClick}
        aria-label={`${action}, ${siteName}, ${dayName}`}
        sx={{
          width: '100%',
          minHeight: 48,
          px: 1.25,
          py: 0.75,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 0.5,
          borderRadius: 2,
          textAlign: 'left',
          bgcolor: (t) => alpha(t.palette[meta.tone].main, t.palette.mode === 'dark' ? 0.2 : 0.12),
          transition: 'background-color 0.15s',
          '&:hover': { bgcolor: (t) => alpha(t.palette[meta.tone].main, t.palette.mode === 'dark' ? 0.3 : 0.2) },
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
          ...(flash && { animation: `${flashPulse} 1.6s ease-out` }),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 0.5 }}>
          <Typography
            component="span"
            sx={{ flex: 1, fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.2, color: (t) => t.palette[meta.tone][t.palette.mode === 'dark' ? 'light' : 'dark'] }}
          >
            {meta.label}
          </Typography>
          {note && <StickyNote2Outlined sx={{ fontSize: 13, color: 'text.secondary' }} />}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: logged ? 'text.primary' : 'text.secondary' }}>
          {logged ? <CheckCircleOutline sx={{ fontSize: 15 }} /> : <Schedule sx={{ fontSize: 15 }} />}
          <Typography component="span" sx={{ fontSize: '0.72rem', fontWeight: logged ? 700 : 500, lineHeight: 1.2 }}>
            {logged ? value : 'Planificado'}
          </Typography>
        </Box>
      </ButtonBase>
    </Tooltip>
  );
}

/**
 * Add a log in a cell. `fill`: the whole empty cell is the target, with a centered "+".
 * Otherwise it is a slim row under the cards, apart from them, so it is never mistaken for "edit".
 */
export function AddInCell({ siteName, dayName, onClick, fill = false }) {
  return (
    <Tooltip arrow enterDelay={400} title={`Agregar log · ${siteName}, ${dayName}`}>
      <ButtonBase
        onClick={onClick}
        aria-label={`Agregar log, ${siteName}, ${dayName}`}
        className="add-in-cell"
        sx={{
          width: '100%',
          minHeight: fill ? 56 : 24,
          flex: fill ? 1 : 'none',
          borderRadius: 2,
          color: 'text.secondary',
          transition: 'opacity 0.15s, background-color 0.15s, color 0.15s',
          opacity: fill ? 0.55 : 0.6,
          [HOVER]: { opacity: fill ? 0.45 : 0 },
          '&:hover, &.Mui-focusVisible': {
            opacity: 1,
            color: 'primary.main',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          },
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
        }}
      >
        <Add sx={{ fontSize: fill ? 20 : 18 }} />
      </ButtonBase>
    </Tooltip>
  );
}

/** Key over the grid: color = type of service, icon = state. */
export function LogLegend() {
  const swatch = (tone, icon) => (
    <Box
      component="span"
      sx={{
        width: 20, height: 20, borderRadius: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: (t) => alpha(t.palette[tone].main, 0.15), color: (t) => t.palette[tone][t.palette.mode === 'dark' ? 'light' : 'dark'],
      }}
    >
      {icon}
    </Box>
  );
  const item = (icon, label) => (
    <Box component="li" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      {icon}
      <Typography component="span" variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  );
  const check = <CheckCircleOutline sx={{ fontSize: 13 }} />;
  return (
    <Box
      component="ul"
      aria-label="Leyenda"
      sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2.5, rowGap: 1 }}
    >
      {item(swatch('success', check), 'Service registrado')}
      {item(swatch('info', check), 'Bins registrado')}
      {item(<Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />, 'Pendiente de registrar')}
    </Box>
  );
}

/** Operational summary of the displayed week, so the grid does not have to be scanned to know the load. */
export function WeekSummary({ items }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {items.map(({ label, value, tone }) => (
        <Box
          key={label}
          sx={{
            display: 'inline-flex', alignItems: 'baseline', gap: 0.75, px: 1.25, py: 0.5, borderRadius: 999,
            bgcolor: (t) => (tone ? alpha(t.palette[tone].main, 0.12) : t.palette.action.hover),
          }}
        >
          <Typography component="span" variant="body2" fontWeight={700} sx={{ color: (t) => (tone ? t.palette[tone][t.palette.mode === 'dark' ? 'light' : 'dark'] : t.palette.text.primary) }}>
            {value}
          </Typography>
          <Typography component="span" variant="caption" color="text.secondary" sx={{ textTransform: 'none', letterSpacing: 0 }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
