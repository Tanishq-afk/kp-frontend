import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, MenuItem,
  Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import * as duesApi from 'src/api/dues.api.js';
import { errorMessage, formatCurrency, formatDate, formatDateTime } from 'src/utils/format.js';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from 'src/config/constants.js';

// One customer's open credit bills and payment history. Admins can record a payment
// here; it is applied to the oldest open bill first.
export default function CustomerDuesDialog({ customerId, onClose, canReceive }) {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading } = useQuery({
    queryKey: ['customer-dues', customerId],
    queryFn: () => duesApi.getCustomerDues(customerId).then((r) => r.data),
    enabled: Boolean(customerId),
  });

  const totalDue = data?.totalDue || 0;
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [reference, setReference] = useState('');
  const amountValue = amount === '' ? totalDue : Number(amount);
  const amountError =
    !Number.isFinite(amountValue) || amountValue <= 0
      ? 'Enter an amount above 0'
      : amountValue > totalDue
        ? `More than the outstanding ${formatCurrency(totalDue)}`
        : '';

  const receive = useMutation({
    mutationFn: () =>
      duesApi.recordPayment({ customer: customerId, amount: amountValue, method, reference: reference.trim() || undefined }),
    onSuccess: () => {
      enqueueSnackbar('Payment recorded', { variant: 'success' });
      setAmount('');
      setReference('');
      qc.invalidateQueries({ queryKey: ['customer-dues', customerId] });
      qc.invalidateQueries({ queryKey: ['dues-outstanding'] });
      qc.invalidateQueries({ queryKey: ['bills'] });
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  return (
    <Dialog open={Boolean(customerId)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {data ? `${data.customer.name} · ${data.customer.phone}` : 'Customer dues'}
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading || !data ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={700} color={totalDue > 0 ? 'error.main' : 'success.main'}>
              {totalDue > 0 ? `Outstanding ${formatCurrency(totalDue)}` : 'Nothing outstanding'}
            </Typography>

            {data.bills.length > 0 && (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Paid</TableCell>
                      <TableCell align="right">Pending</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.bills.map((b) => (
                      <TableRow key={b._id}>
                        <TableCell sx={{ fontWeight: 600 }}>{b.billNumber}</TableCell>
                        <TableCell>{formatDate(b.createdAt)}</TableCell>
                        <TableCell align="right">{formatCurrency(b.total)}</TableCell>
                        <TableCell align="right">{formatCurrency(b.amountPaid)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>{formatCurrency(b.amountDue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {canReceive && totalDue > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle2">Receive payment</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Amount"
                    type="number"
                    size="small"
                    value={amount}
                    placeholder={String(totalDue)}
                    onChange={(e) => setAmount(e.target.value)}
                    error={Boolean(amountError)}
                    helperText={amountError || 'Blank = full outstanding'}
                    inputProps={{ min: 0, step: '0.01' }}
                  />
                  <TextField select label="Method" size="small" value={method} onChange={(e) => setMethod(e.target.value)} sx={{ minWidth: 130 }}>
                    {PAYMENT_METHODS.map((m) => (
                      <MenuItem key={m} value={m}>{PAYMENT_METHOD_LABELS[m] || m}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Reference (optional)" size="small" fullWidth value={reference} onChange={(e) => setReference(e.target.value)} />
                </Stack>
                <Box>
                  <Button variant="contained" disabled={Boolean(amountError) || receive.isPending} onClick={() => receive.mutate()}>
                    {receive.isPending ? 'Saving…' : 'Record payment'}
                  </Button>
                </Box>
              </>
            )}

            {data.payments.length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle2">Payments received</Typography>
                <Stack spacing={1}>
                  {data.payments.map((p) => (
                    <Stack key={p._id} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{formatDateTime(p.receivedAt)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {PAYMENT_METHOD_LABELS[p.method] || p.method}
                          {p.reference ? ` · ${p.reference}` : ''}
                          {p.allocations?.length ? ` · ${p.allocations.map((a) => a.billNumber).join(', ')}` : ''}
                        </Typography>
                      </Box>
                      <Chip size="small" label={formatCurrency(p.amount)} />
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
