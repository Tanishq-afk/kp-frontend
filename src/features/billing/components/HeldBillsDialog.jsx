import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Chip, Dialog, DialogContent, DialogTitle, Divider, IconButton,
  List, ListItem, Stack, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import * as billsApi from '../../../api/bills.api.js';
import { formatCurrency, formatDateTime, errorMessage } from '../../../utils/format.js';
import { PAYMENT_METHOD } from '../../../config/constants.js';

// Parked bills: settle in cash or discard. (Cash settle uses the held bill's
// stored total; the backend re-validates the items on completion.)
export default function HeldBillsDialog({ open, onClose, onSettled }) {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['heldBills'],
    queryFn: () => billsApi.listHeldBills().then((r) => r.data),
    enabled: open,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['heldBills'] });

  const settle = useMutation({
    mutationFn: (bill) =>
      billsApi.completeHeldBill(bill._id, {
        payments: [{ method: PAYMENT_METHOD.CASH, amount: bill.total }],
      }),
    onSuccess: (res) => {
      enqueueSnackbar(`Bill ${res.data.billNumber} completed`, { variant: 'success' });
      refresh();
      onSettled?.();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  const discard = useMutation({
    mutationFn: (id) => billsApi.discardBill(id),
    onSuccess: () => {
      enqueueSnackbar('Held bill discarded', { variant: 'info' });
      refresh();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  const bills = data || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Held bills
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && <Typography color="text.secondary">Loading…</Typography>}
        {!isLoading && bills.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No held bills.
          </Typography>
        )}
        <List disablePadding>
          {bills.map((b, idx) => (
            <Box key={b._id}>
              <ListItem disableGutters sx={{ py: 1.5 }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" color="warning" label={b.holdRef} />
                    <Typography fontWeight={600} noWrap>
                      {b.customerName || 'Walk-in'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {b.items?.length || 0} item(s) · {formatDateTime(b.heldAt || b.createdAt)}
                  </Typography>
                </Box>
                <Stack alignItems="flex-end" spacing={1}>
                  <Typography fontWeight={700}>{formatCurrency(b.total)}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => discard.mutate(b._id)}
                      disabled={discard.isPending}
                    >
                      Discard
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => settle.mutate(b)}
                      disabled={settle.isPending}
                    >
                      Settle (cash)
                    </Button>
                  </Stack>
                </Stack>
              </ListItem>
              {idx < bills.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
