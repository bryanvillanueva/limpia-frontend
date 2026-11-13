import { Box, Typography, ButtonBase, Tooltip, alpha } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { CheckCircleOutline, Add, StickyNote2Outlined, EventRepeatOutlined } from '@mui/icons-material';
import { typeMeta, hoursLabel } from './logGrid';

// Brief pulse on a log that was just created or edited, so the user sees where it landed
const flashPulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(38, 97, 79, 0.55); }
  100% { box-shadow: 0 0 0 10px rgba(38, 97, 79, 0); }
`;

/**
 * One service in a cell. PLANNED and REGISTERED are two clearly different looks, not two shades of one:
 *  - Planned: dashed outline, almost no fill, muted text, calendar icon + "Planificado".
 *  - Registered: solid fill, check icon, bold text and the hours.
 * The type (Service / Bins / Otro) is the hue in both, so color never carries the state on its own.
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
  const tone = (t) => t.palette[meta.tone];
  const strong = (t) => tone(t)[t.palette.mode === 'dark' ? 'light' : 'dark'];

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
          minHeight: 44,
          px: 1.25,
          py: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: 1,
          rowGap: 0.25,
          borderRadius: '8px',
          textAlign: 'left',
          border: '1px',
          borderStyle: logged ? 'solid' : 'dashed',
          borderColor: (t) => (logged ? 'transparent' : alpha(tone(t).main, 0.5)),
          bgcolor: (t) => (logged
            ? alpha(tone(t).main, t.palette.mode === 'dark' ? 0.22 : 0.14)
            : t.palette.background.paper),
          transition: 'background-color 0.15s, border-color 0.15s',
          '&:hover': {
            bgcolor: (t) => alpha(tone(t).main, logged ? (t.palette.mode === 'dark' ? 0.32 : 0.22) : 0.06),
            ...(!logged && { borderColor: (t) => tone(t).main }),
          },
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
          ...(flash && { animation: `${flashPulse} 1.6s ease-out` }),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          {logged
            ? <CheckCircleOutline sx={{ fontSize: 16, color: strong }} />
            : <EventRepeatOutlined sx={{ fontSize: 16, color: (t) => alpha(strong(t), 0.7) }} />}
          <Typography
            component="span"
            sx={{
              fontSize: '0.8rem',
              lineHeight: 1.2,
              fontWeight: logged ? 700 : 600,
              color: (t) => (logged ? strong(t) : alpha(strong(t), 0.75)),
            }}
          >
            {meta.label}
          </Typography>
          {note && <StickyNote2Outlined sx={{ fontSize: 13, color: 'text.secondary' }} />}
        </Box>
        <Typography
          component="span"
          sx={{
            fontSize: logged ? '0.8rem' : '0.7rem',
            lineHeight: 1.2,
            fontWeight: logged ? 700 : 500,
            color: (t) => (logged ? strong(t) : t.palette.text.secondary),
            whiteSpace: 'nowrap',
          }}
        >
          {logged ? value : 'Planificado'}
        </Typography>
      </ButtonBase>
    </Tooltip>
  );
}

/** An empty cell is one big add target, with a discreet "+" that gets stronger on hover/focus. */
export function AddInCell({ siteName, dayName, onClick }) {
  return (
    <Tooltip arrow enterDelay={400} title={`Agregar log · ${siteName}, ${dayName}`}>
      <ButtonBase
        onClick={onClick}
        aria-label={`Agregar log, ${siteName}, ${dayName}`}
        sx={{
          width: '100%',
          minHeight: 56,
          flex: 1,
          borderRadius: '8px',
          color: 'text.secondary',
          opacity: 0.5,
          transition: 'opacity 0.15s, background-color 0.15s, color 0.15s',
          '&:hover, &.Mui-focusVisible': {
            opacity: 1,
            color: 'primary.main',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          },
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
        }}
      >
        <Add sx={{ fontSize: 20 }} />
      </ButtonBase>
    </Tooltip>
  );
}

/** Key over the grid: dashed = planned, filled = registered; hue = type of service. */
export function LogLegend() {
  const sample = (logged) => (
    <Box
      component="span"
      sx={{
        width: 26, height: 18, borderRadius: '5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1px', borderStyle: logged ? 'solid' : 'dashed',
        borderColor: (t) => (logged ? 'transparent' : alpha(t.palette.text.secondary, 0.6)),
        bgcolor: (t) => (logged ? alpha(t.palette.text.secondary, 0.16) : 'transparent'),
        color: 'text.secondary',
      }}
    >
      {logged ? <CheckCircleOutline sx={{ fontSize: 12 }} /> : <EventRepeatOutlined sx={{ fontSize: 12 }} />}
    </Box>
  );
  const dot = (tone) => <Box component="span" sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: `${tone}.main` }} />;
  const item = (icon, label) => (
    <Box component="li" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      {icon}
      <Typography component="span" variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  );
  return (
    <Box
      component="ul"
      aria-label="Leyenda"
      sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2, rowGap: 1 }}
    >
      {item(sample(false), 'Planificado')}
      {item(sample(true), 'Registrado')}
      <Box component="li" aria-hidden sx={{ width: '1px', height: 16, bgcolor: 'divider' }} />
      {item(dot('success'), 'Service')}
      {item(dot('info'), 'Bins')}
      {item(dot('warning'), 'Otro')}
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
