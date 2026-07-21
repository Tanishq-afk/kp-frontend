import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------------
// Dark-first palette. Full tonal ramps per hue, then semantic tokens derived
// from them. `primary.main` (#A2FF00, vivid lime) is the single brand accent
// against near-black surfaces; everything else is neutral dark greys.
// ----------------------------------------------------------------------------

export const grey = {
  50: '#EFEFEF', 100: '#CDCECD', 200: '#B4B6B5', 300: '#929594', 400: '#7D817F',
  500: '#5D615F', 600: '#555856', 700: '#424543', 800: '#333534', 900: '#222423',
};

export const dark = {
  50: '#E8E8E8', 100: '#B8B8B8', 200: '#959696', 300: '#656666', 400: '#474948',
  500: '#272928', 600: '#191B1A', 700: '#121312', 800: '#0E0F0E', 900: '#0B0B0B',
};

export const green = {
  50: '#F6FFE6', 100: '#E2FFB0', 200: '#D4FF8A', 300: '#C1FF54', 400: '#B5FF33',
  500: '#A2FF00', 600: '#93E800', 700: '#73B500', 800: '#598C00', 900: '#446B00',
};

export const darkGreen = {
  50: '#E8F4EC', 100: '#B6DEC3', 200: '#93CDA7', 300: '#62B77E', 400: '#44A965',
  500: '#15933F', 600: '#138639', 700: '#0F682D', 800: '#0C5123', 900: '#093E1A',
};

export const purple = {
  50: '#EFE6FD', 100: '#CEB0FA', 200: '#B78AF7', 300: '#9654F4', 400: '#8133F1',
  500: '#6200EE', 600: '#5900D9', 700: '#4600A9', 800: '#360083', 900: '#290064',
};

export const blue = {
  50: '#E8EAF4', 100: '#B9BEDC', 200: '#979ECB', 300: '#6772B3', 400: '#4957A4',
  500: '#1C2D8D', 600: '#192980', 700: '#142064', 800: '#0F194E', 900: '#0C133B',
};

export const red = {
  50: '#FDEBEB', 100: '#F7C2C2', 200: '#F4A5A5', 300: '#EE7C7C', 400: '#EB6262',
  500: '#E63B3B', 600: '#D13636', 700: '#A32A2A', 800: '#7F2020', 900: '#611919',
};

// ---- semantic tokens ----
const primary = {
  lighter: '#D2FEAB', light: '#9DEF34', main: '#A2FF00', dark: '#4D7914',
  darker: '#375515', contrastText: '#090B0A', drawerBg: '#191B1A',
};
const secondary = {
  lighter: '#B3B4B9', light: '#6D6E73', main: '#3A3A3D', dark: '#292A2C',
  darker: '#19191A', contrastText: '#EBEBEC',
};
const info = {
  lighter: '#CAFDF5', light: '#61F3F3', main: '#00B8D9', dark: '#006C9C',
  darker: '#003768', contrastText: '#FFFFFF',
};
const success = {
  lighter: '#C8FAD6', light: '#5BE49B', main: '#00A76F', dark: '#007867',
  darker: '#004B50', contrastText: '#FFFFFF',
};
const warning = {
  lighter: '#FFF5CC', light: '#FFD666', main: '#FFAB00', dark: '#B76E00',
  darker: '#7A4100', contrastText: grey[800],
};
const error = {
  lighter: '#FFE9D5', light: '#FFAC82', main: '#E83D3D', dark: '#B71D18',
  darker: '#7A0916', contrastText: '#FFFFFF',
};
const common = { black: '#000000', white: '#FFFFFF' };

const palette = {
  mode: 'dark',
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  grey,
  // extra ramps kept on the palette so components can read them like MUI tokens
  dark,
  green,
  darkGreen,
  purple,
  blue,
  red,
  divider: alpha(grey[500], 0.24),
  text: {
    primary: '#FFFFFF',
    secondary: '#9EA1A5',
    disabled: grey[500],
  },
  background: {
    paper: grey[900],
    default: dark[900],
    neutral: dark[600],
  },
  action: {
    hover: alpha(grey[500], 0.08),
    selected: alpha(grey[500], 0.16),
    disabled: alpha(grey[500], 0.8),
    disabledBackground: alpha(grey[500], 0.24),
    focus: alpha(grey[500], 0.24),
    active: grey[600],
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
  overlay: {
    8: alpha(grey[50], 0.08),
    10: alpha(grey[50], 0.1),
    20: alpha(dark[900], 0.2),
    40: alpha(dark[900], 0.4),
    80: alpha(dark[900], 0.8),
  },
};

export default palette;
