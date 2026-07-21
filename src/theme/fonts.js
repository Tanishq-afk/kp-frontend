// Self-hosted fonts via @fontsource (bundled .woff2, no external requests).
// Manrope stands in for Satoshi (licensed); Satisfy is the open script accent.
// To use the real Satoshi later: drop its files in src/assets/fonts, add an
// @font-face for it, and change PRIMARY_FONT to 'Satoshi'.
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import '@fontsource/satisfy/400.css';

export const PRIMARY_FONT = 'Manrope';
export const SECONDARY_FONT = 'Satisfy';
