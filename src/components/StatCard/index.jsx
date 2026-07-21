import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';

// KPI tile: icon + label + big value.
export default function StatCard({ label, value, icon, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: `${color}.main`, width: 44, height: 44 }}>
            {icon}
          </Avatar>
          <div>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
              {value}
            </Typography>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
