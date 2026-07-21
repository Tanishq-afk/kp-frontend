import { useMediaQuery, useTheme } from '@mui/material';

// True on phone-sized screens (< sm). Used to make dialogs full-screen etc.
export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}
