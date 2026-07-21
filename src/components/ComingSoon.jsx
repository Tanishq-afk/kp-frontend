import { Box, Paper, Typography } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import PageHeader from './PageHeader.jsx';

// Placeholder for routes that are wired up but not built yet.
export default function ComingSoon({ title }) {
  return (
    <Box>
      <PageHeader title={title} />
      <Paper sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
        <ConstructionRoundedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.6 }} />
        <Typography variant="h6">Coming soon</Typography>
        <Typography variant="body2">This screen is being built.</Typography>
      </Paper>
    </Box>
  );
}
