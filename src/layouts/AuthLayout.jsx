import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Outlet } from 'react-router-dom';

// Centered shell for the login screen, with a soft brand gradient.
export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background:
          'radial-gradient(80% 60% at 50% -10%, rgba(162,255,0,0.12) 0%, rgba(11,11,11,0) 60%), #0B0B0B',
      }}
    >
      <Suspense fallback={<CircularProgress sx={{ color: '#fff' }} />}>
        <Outlet />
      </Suspense>
    </Box>
  );
}
