import { createTheme } from '@mui/material/styles';

const FONT = '"Montserrat", "Gotham", "Helvetica Neue", Arial, sans-serif';

// Brand greens
const GREEN = {
  main:    '#26614f',
  light:   '#e8f5e9',    // very faint mint for subtle highlights
  dark:    '#1b4a3b',
  50:      '#f1f8f4',     // lightest tint — used for hover
};

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main:         GREEN.main,
        light:        '#3a8068',
        dark:         GREEN.dark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#5a6e5c',
        contrastText: '#ffffff',
      },
      success: { main: '#2e7d32' },
      ...(mode === 'light'
        ? {
            background: {
              default: '#f9fafb',  // very light warm gray — not pure white, avoids harshness
              paper:   '#ffffff',  // cards, drawers, dialogs = white
            },
            text: {
              primary:   '#1a1a1a',
              secondary: '#637381',
              white: '#ffffff',
            },
            divider: '#e5e7eb',
          }
        : {
            background: {
              default: '#0a0a0a',
              paper:   '#141414',
            },
            text: {
              primary:   '#f1f1f1',
              secondary: '#9ca3af',
            },
            divider: '#2a2a2a',
          }),
    },

    typography: {
      fontFamily: FONT,
      h4: { fontWeight: 800, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.6 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
      caption: { fontSize: '0.75rem', letterSpacing: '0.03em', textTransform: 'uppercase', fontWeight: 500 },
    },

    shape: { borderRadius: 10 },

    shadows: [
      'none',
      '0 1px 2px 0 rgba(0,0,0,0.04)',                // 1
      '0 1px 3px 0 rgba(0,0,0,0.06)',                 // 2
      '0 4px 6px -1px rgba(0,0,0,0.06)',              // 3
      '0 10px 15px -3px rgba(0,0,0,0.06)',            // 4
      ...Array(20).fill('0 10px 15px -3px rgba(0,0,0,0.06)'),  // 5–24
    ],

    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            fontSize: '0.8125rem',
          },
          containedPrimary: {
            '&:hover': { backgroundColor: GREEN.dark },
          },
          outlined: {
            borderWidth: 1.5,
            '&:hover': { borderWidth: 1.5 },
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            backgroundImage: 'none',
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.75rem' },
          sizeSmall: { height: 24 },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: mode === 'light' ? GREEN[50] : '#1a1a1a',
            '& .MuiTableCell-head': {
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: theme.palette.text.secondary,
              borderBottom: `2px solid ${theme.palette.divider}`,
            },
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.8125rem',
            padding: '12px 16px',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&:hover': {
              backgroundColor: mode === 'light' ? GREEN[50] : 'rgba(255,255,255,0.02)',
            },
            '&:last-child td': { borderBottom: 0 },
          }),
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 14 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
          }),
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            minHeight: 44,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8, fontSize: '0.8125rem' },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4, height: 6 },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: { borderRadius: 6 },
        },
      },
    },
  });
