import { alpha } from '@mui/material/styles';
import { grey } from './palette.js';

// Custom (non-MUI-native) shadow key bolted onto the theme so components can
// read theme.customShadows.card the same way they read theme.palette.*.
// Kept subtle (alpha 0.08–0.24) so they work on dark surfaces.
export default function customShadows() {
  const g = grey[500];
  return {
    z1: `0 1px 2px 0 ${alpha(g, 0.16)}`,
    z4: `0 4px 8px 0 ${alpha(g, 0.16)}`,
    z8: `0 8px 16px 0 ${alpha(g, 0.16)}`,
    z12: `0 12px 24px -4px ${alpha(g, 0.16)}`,
    z16: `0 16px 32px -4px ${alpha(g, 0.16)}`,
    z20: `0 20px 40px -4px ${alpha(g, 0.16)}`,
    z24: `0 24px 48px 0 ${alpha(g, 0.16)}`,
    card: `0 0 2px 0 ${alpha(g, 0.08)}, 0 12px 24px -4px ${alpha(g, 0.08)}`,
    dropdown: `0 0 2px 0 ${alpha(g, 0.24)}, -20px 20px 40px -4px ${alpha(g, 0.24)}`,
    dialog: `-40px 40px 80px -8px ${alpha('#000000', 0.24)}`,
    primary: `0 8px 16px 0 ${alpha('#A2FF00', 0.24)}`,
    info: `0 8px 16px 0 ${alpha('#00B8D9', 0.24)}`,
    secondary: `0 8px 16px 0 ${alpha('#3A3A3D', 0.24)}`,
    success: `0 8px 16px 0 ${alpha('#00A76F', 0.24)}`,
    warning: `0 8px 16px 0 ${alpha('#FFAB00', 0.24)}`,
    error: `0 8px 16px 0 ${alpha('#E83D3D', 0.24)}`,
  };
}
