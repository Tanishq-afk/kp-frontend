import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Alert, Avatar, Box, Button, Card, CardContent, InputAdornment, Stack,
  TextField, Typography,
} from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useAuth } from 'src/hooks/useAuth.js';
import { ROLE } from 'src/config/constants.js';
import { errorMessage } from 'src/utils/format.js';

export default function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { phone: '', password: '' } });

  // Already signed in -> go to the role's home.
  if (isAuthenticated) {
    return <Navigate to={role === ROLE.SUPERADMIN ? '/dashboard' : '/billing'} replace />;
  }

  const onSubmit = async ({ phone, password }) => {
    setError('');
    try {
      // Send the 10 digits only (a leading 91 country code is dropped).
      const digits = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
      const user = await login(digits, password);
      navigate(user.role === ROLE.SUPERADMIN ? '/dashboard' : '/billing', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed'));
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>
            <StorefrontRoundedIcon />
          </Avatar>
          <Typography variant="h5">Kidz Plaza</Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to the POS
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            <TextField
              label="Phone number"
              type="tel"
              fullWidth
              autoFocus
              autoComplete="username"
              inputProps={{ inputMode: 'tel' }}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              {...register('phone', {
                required: 'Phone number is required',
                validate: (value) => {
                  const digits = value.replace(/\D/g, '');
                  return (digits.length === 10 || (digits.length === 12 && digits.startsWith('91')))
                    || 'Enter a 10-digit mobile number';
                },
              })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              {...register('password', { required: 'Password is required' })}
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
