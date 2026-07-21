import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Alert, Avatar, Box, Button, Card, CardContent, InputAdornment, Stack,
  TextField, Typography,
} from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE } from '../../config/constants.js';
import { errorMessage } from '../../utils/format.js';

export default function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  // Already signed in -> go to the role's home.
  if (isAuthenticated) {
    return <Navigate to={role === ROLE.SUPERADMIN ? '/dashboard' : '/billing'} replace />;
  }

  const onSubmit = async ({ email, password }) => {
    setError('');
    try {
      const user = await login(email, password);
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
              label="Email"
              type="email"
              fullWidth
              autoFocus
              autoComplete="username"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
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
