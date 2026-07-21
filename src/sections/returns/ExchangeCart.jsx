import { Paper, Stack, Typography } from '@mui/material';
import ScanBox from 'src/sections/billing/ScanBox.jsx';
import CartList from 'src/sections/billing/CartList.jsx';

// Optional exchange leg: scan new items the customer is buying in the same
// transaction. Reuses the billing scan box + cart.
export default function ExchangeCart({ onScan, scanning, items, onRemove }) {
  return (
    <Stack spacing={1.5}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Exchange for new items{' '}
          <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography>
        </Typography>
        <ScanBox onScan={onScan} loading={scanning} />
      </Paper>
      {items.length > 0 && <CartList items={items} onRemove={onRemove} />}
    </Stack>
  );
}
