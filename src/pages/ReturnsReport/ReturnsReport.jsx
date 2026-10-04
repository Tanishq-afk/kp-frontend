import { Box } from '@mui/material';
import PageHeader from 'src/components/PageHeader';
import ReturnsHistory from 'src/sections/returns/ReturnsHistory.jsx';

// Superadmin oversight: every sales return with a date-range filter and a printed list.
export default function ReturnsReportPage() {
  return (
    <Box>
      <PageHeader title="Returns" subtitle="All sales returns" />
      <ReturnsHistory printable />
    </Box>
  );
}
