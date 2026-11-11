import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/**
 * Date input with a themed calendar (replaces the browser's native <input type="date">).
 *
 * Works with plain 'YYYY-MM-DD' strings, like the native input did, and calls `onChange`
 * with an event-like `{ target: { name, value } }` so existing `e.target.value` handlers
 * keep working. An empty or invalid date gives `value: ''`.
 *
 * Accepts the same `slotProps.htmlInput.min/max` the old TextField used, so call sites
 * only had to change the tag.
 *
 * `shouldDisableDate(dayjsDate) => boolean` greys out the days that cannot be picked.
 *
 * On touch devices the picker opens as a full dialog; with a mouse it opens as a popover.
 */
export default function DateField({
  label,
  value,
  onChange,
  name,
  required,
  disabled,
  error,
  helperText,
  fullWidth = true,
  size = 'small',
  min,
  max,
  slotProps,
  shouldDisableDate,
  sx,
}) {
  const minDate = min ?? slotProps?.htmlInput?.min;
  const maxDate = max ?? slotProps?.htmlInput?.max;
  const parsed = value ? dayjs(value) : null;

  return (
    <DatePicker
      label={label}
      value={parsed && parsed.isValid() ? parsed : null}
      onChange={(d) => onChange?.({ target: { name, value: d && d.isValid() ? d.format('YYYY-MM-DD') : '' } })}
      format="DD/MM/YYYY"
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      disabled={disabled}
      showDaysOutsideCurrentMonth
      shouldDisableDate={shouldDisableDate}
      slotProps={{
        textField: { size, fullWidth, required, error, helperText, name, sx },
        actionBar: { actions: ['today'] },
        popper: { sx: { '& .MuiPaper-root': { borderRadius: 3, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' } } },
      }}
    />
  );
}
