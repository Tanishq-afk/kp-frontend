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
        background: 'linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)',
      }}
    >
      <Suspense fallback={<CircularProgress sx={{ color: '#fff' }} />}>
        <Outlet />
      </Suspense>
    </Box>
  );
}
