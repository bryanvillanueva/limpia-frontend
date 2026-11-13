/** Hours with their unit and no trailing zeros: 1.25 -> "1.25 h", 2 -> "2 h", null -> "0 h". */
export const formatHours = (n) => `${Number(n || 0).toFixed(2).replace(/\.?0+$/, '') || '0'} h`;
