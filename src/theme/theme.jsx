import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './fonts.js';
import palette from './palette.js';
import typography from './typography.js';
import customShadows from './customShadows.js';
import gradient from './gradient.js';
import overrides from './overrides.js';

// Composes palette + typography + customShadows + gradient into the MUI theme,
// then attaches component overrides (which need the built theme).
export default function ThemeProvider({ children }) {
  const memoizedValue = useMemo(
    () => ({
      palette,
      typography,
      customShadows: customShadows(),
      gradient: gradient(),
      shape: { borderRadius: 8 },
    }),
    []
  );

  const theme = createTheme(memoizedValue);
  theme.components = overrides(theme);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
};
