// Every component-level style customization lives here (one file) instead of
// scattering `sx` overrides per usage. Receives the built theme so it can read
// palette / gradient / customShadows.
export default function overrides(theme) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        html: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', height: '100%' },
        body: { height: '100%', backgroundColor: theme.palette.background.default },
        '#root': { height: '100%' },
        // custom scrollbar
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-track': { background: theme.palette.dark[700] },
        '*::-webkit-scrollbar-thumb': { background: theme.palette.dark[400], borderRadius: 8 },
        '*::-webkit-scrollbar-thumb:hover': { background: theme.palette.dark[300] },
        // keep browser autofill dark
        'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active':
          {
            WebkitBoxShadow: '0 0 0 100px #202220 inset',
            WebkitTextFillColor: theme.palette.text.primary,
            caretColor: theme.palette.text.primary,
            borderRadius: 'inherit',
          },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: {
        root: { borderRadius: 10, textTransform: 'unset', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        containedPrimary: {
          background: theme.gradient.green[100],
          color: theme.palette.primary.contrastText,
          '&:hover': { background: theme.gradient.green[400] },
          // Keep neon buttons' text black even when disabled (MUI otherwise
          // forces grey text); just dim the whole button to show it's disabled.
          '&.Mui-disabled': {
            background: theme.gradient.green[100],
            color: theme.palette.primary.contrastText,
            opacity: 0.45,
          },
        },
      },
    },
    MuiIconButton: { defaultProps: { disableRipple: true } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none', border: `1px solid ${theme.palette.divider}` } },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: `1px solid ${theme.palette.divider}`, boxShadow: theme.customShadows.card, borderRadius: 16 },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'inherit', elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.primary.drawerBg,
          backgroundImage: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { backgroundColor: theme.palette.primary.drawerBg, backgroundImage: 'none' } },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: theme.palette.divider },
        root: { '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[600] } },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiMenuItem: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: theme.palette.divider },
        head: { color: theme.palette.text.secondary, fontWeight: 700, backgroundColor: theme.palette.background.paper },
      },
    },
    MuiBackdrop: { styleOverrides: { root: { backgroundColor: theme.palette.overlay[80] } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: theme.palette.grey[700] },
        arrow: { color: theme.palette.grey[700] },
      },
    },
  };
}
