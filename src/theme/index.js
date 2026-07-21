import { createTheme } from '@mui/material/styles';

// Clean, modern, friendly theme for the Kidz Plaza POS. System font stack so we
// don't depend on a web font; rounded surfaces; flat buttons.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6d28d9', light: '#8b5cf6', dark: '#5b21b6', contrastText: '#fff' },
    secondary: { main: '#ec4899', contrastText: '#fff' },
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#dc2626' },
    info: { main: '#0ea5e9' },
    background: { default: '#f4f5fb', paper: '#ffffff' },
    text: { primary: '#1f2433', secondary: '#5b6275' },
    divider: 'rgba(15, 23, 42, 0.08)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', borderRadius: 10 } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid rgba(15, 23, 42, 0.06)', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'inherit', elevation: 0 },
      styleOverrides: { root: { backgroundColor: '#ffffff', borderBottom: '1px solid rgba(15,23,42,0.08)' } },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

export default theme;
