import { PRIMARY_FONT, SECONDARY_FONT } from './fonts.js';

export function pxToRem(value) {
  return `${value / 16}rem`;
}

// Step-up font sizes at the sm/md/lg breakpoints.
export function responsiveFontSizes({ sm, md, lg }) {
  return {
    '@media (min-width:600px)': { fontSize: pxToRem(sm) },
    '@media (min-width:900px)': { fontSize: pxToRem(md) },
    '@media (min-width:1200px)': { fontSize: pxToRem(lg) },
  };
}

const typography = {
  fontFamily: `${PRIMARY_FONT}, sans-serif`,
  fontSecondaryFamily: `${SECONDARY_FONT}, sans-serif`,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  h1: { fontWeight: 800, lineHeight: 1.15, fontSize: pxToRem(40), ...responsiveFontSizes({ sm: 52, md: 58, lg: 64 }) },
  h2: { fontWeight: 800, lineHeight: 1.2, fontSize: pxToRem(32), ...responsiveFontSizes({ sm: 40, md: 44, lg: 48 }) },
  h3: { fontWeight: 700, lineHeight: 1.25, fontSize: pxToRem(24), ...responsiveFontSizes({ sm: 26, md: 30, lg: 32 }) },
  h4: { fontWeight: 700, lineHeight: 1.3, fontSize: pxToRem(20), ...responsiveFontSizes({ sm: 20, md: 24, lg: 24 }) },
  h5: { fontWeight: 700, lineHeight: 1.4, fontSize: pxToRem(18), ...responsiveFontSizes({ sm: 19, md: 20, lg: 20 }) },
  h6: { fontWeight: 700, lineHeight: 1.5, fontSize: pxToRem(17), ...responsiveFontSizes({ sm: 18, md: 18, lg: 18 }) },
  subtitle1: { fontWeight: 600, lineHeight: 1.5, fontSize: pxToRem(16) },
  subtitle2: { fontWeight: 600, lineHeight: 1.5, fontSize: pxToRem(14) },
  body1: { fontWeight: 400, lineHeight: 1.5, fontSize: pxToRem(16) },
  body2: { fontWeight: 400, lineHeight: 1.5, fontSize: pxToRem(14) },
  caption: { fontWeight: 400, lineHeight: 1.5, fontSize: pxToRem(12) },
  overline: { fontWeight: 500, lineHeight: 1.5, fontSize: pxToRem(12), letterSpacing: 1, textTransform: 'unset' },
  button: { fontWeight: 700, lineHeight: 1.7, fontSize: pxToRem(14), textTransform: 'unset' },
};

export default typography;
