import {
  Button, Chip, Dialog, DialogActions, DialogContent, Divider, Stack, Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { formatCurrency } from 'src/utils/format.js';

function Row({ label, value, color }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600} color={color}>{value}</Typography>
    </Stack>
  );
}

const DIRECTION_LABEL = {
  collect: 'Collected from customer',
  refund: 'Refunded to customer',
  even: 'Settled — nothing due',
};

// Confirmation shown after a return / exchange is processed.
export default function ReturnSuccessDialog({ result, onNew }) {
  const r = result;
  const dir = r?.settlement?.direction;
  const newLabels = (r?.items || []).filter((it) => it.newBarcode).length;

  return (
    <Dialog open={Boolean(r)} onClose={onNew} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleRoundedIcon color="success" sx={{ fontSize: 64, mb: 1 }} />
        <Typography variant="h6">Return processed</Typography>
        <Typography color="text.secondary" gutterBottom>
          <strong>{r?.returnNumber}</strong>
        </Typography>

        <Stack spacing={1} sx={{ mt: 2, textAlign: 'left' }}>
          <Row label="Items returned" value={r?.items?.length || 0} />
          <Row label="Return credit" value={formatCurrency(r?.refundTotal)} color="success.main" />
          {r?.exchangeBill && (
            <Row
              label={`New sale ${r.exchangeBill.billNumber || ''}`}
              value={formatCurrency(r?.exchangeTotal)}
            />
          )}
          <Divider />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">{DIRECTION_LABEL[dir] || 'Settled'}</Typography>
            <Chip
              label={formatCurrency(r?.settlement?.amount)}
              color={dir === 'refund' ? 'success' : dir === 'collect' ? 'warning' : 'default'}
            />
          </Stack>
        </Stack>

        {newLabels > 0 && (
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 2 }}>
            {newLabels} new barcode label{newLabels === 1 ? '' : 's'} to print — see the Print Queue.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button fullWidth variant="contained" size="large" onClick={onNew}>
          New return
        </Button>
      </DialogActions>
    </Dialog>
  );
}
