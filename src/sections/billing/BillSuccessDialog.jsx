import { Button, Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { formatCurrency } from 'src/utils/format.js';

// Confirmation shown after a sale completes.
export default function BillSuccessDialog({ bill, onNewSale, onPrint }) {
  return (
    <Dialog open={Boolean(bill)} onClose={onNewSale} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleRoundedIcon color="success" sx={{ fontSize: 64, mb: 1 }} />
        <Typography variant="h6">Sale completed</Typography>
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          <Typography color="text.secondary">
            Invoice <strong>{bill?.billNumber}</strong>
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {formatCurrency(bill?.total)}
          </Typography>
          {bill?.changeReturned > 0 && (
            <Typography color="success.main">
              Change to return: {formatCurrency(bill.changeReturned)}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<PrintRoundedIcon />}
          onClick={() => onPrint?.(bill?._id)}
        >
          Print bill
        </Button>
        <Button fullWidth variant="contained" size="large" onClick={onNewSale}>
          New sale
        </Button>
      </DialogActions>
    </Dialog>
  );
}
