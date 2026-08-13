import { Box } from '@mui/material';
import logo from 'src/assets/kidz-plaza-logo.png';

// Shop logo for the top of printed receipts (bill + day-summary). Pre-processed
// to pure black/transparent (no grayscale) so it prints cleanly on a thermal
// head instead of dithering — see the conversation for how it was derived.
export default function ReceiptLogo({ maxWidth = 260 }) {
  return (
    <Box sx={{ textAlign: 'center', mb: 0.5 }}>
      <Box component="img" src={logo} alt="Kidz Plaza" sx={{ maxWidth, width: '100%', height: 'auto' }} />
    </Box>
  );
}
