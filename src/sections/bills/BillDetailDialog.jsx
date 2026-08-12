import { useQuery } from '@tanstack/react-query';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton,
  Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { useIsMobile } from 'src/hooks/useIsMobile.js';
import * as billsApi from 'src/api/bills.api.js';
import { formatCurrency, formatDateTime } from 'src/utils/format.js';
import { DISCOUNT_TYPE, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_COLOR } from 'src/config/constants.js';

function Line({ label, value, strong, color }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant={strong ? 'subtitle1' : 'body2'} color={color || 'text.secondary'}>
        {label}
      </Typography>
      <Typography variant={strong ? 'h6' : 'body2'} fontWeight={strong ? 700 : 600} color={color}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function BillDetailDialog({ billId, onClose, onPrint }) {
  const open = Boolean(billId);
  const isMobile = useIsMobile();
  const { data: b, isLoading } = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => billsApi.getBill(billId).then((r) => r.data),
    enabled: open,
  });

  const discountLabel =
    b?.discountType === DISCOUNT_TYPE.PERCENT
      ? `${b.discountValue}%  (- ${formatCurrency(b.discount)})`
      : `- ${formatCurrency(b?.discount)}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {b?.billNumber || 'Bill'}
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading || !b ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Box>
                <Typography fontWeight={600}>{b.customerName || 'Walk-in'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {b.customerPhone || '—'} · {formatDateTime(b.createdAt)}
                </Typography>
              </Box>
              <Chip
                size="small"
                color={PAYMENT_STATUS_COLOR[b.paymentStatus] || 'default'}
                label={b.paymentStatus}
                sx={{ textTransform: 'capitalize' }}
              />
            </Stack>

            {b.items?.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell align="right">MRP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {b.items.map((it, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <TableRow key={i}>
                      <TableCell>{it.productName}</TableCell>
                      <TableCell>{it.size}</TableCell>
                      <TableCell align="right">{formatCurrency(it.mrp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No item details for this bill.
              </Typography>
            )}

            <Divider />
            <Stack spacing={1}>
              <Line label="Subtotal" value={formatCurrency(b.subtotal)} />
              <Line label="Discount" value={discountLabel} />
              {b.tax > 0 && <Line label="Tax" value={formatCurrency(b.tax)} />}
              <Divider />
              <Line label="Total" value={formatCurrency(b.total)} strong />
            </Stack>

            <Divider />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Payments
              </Typography>
              <Stack spacing={0.5}>
                {b.payments?.map((p, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Stack key={i} direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      {PAYMENT_METHOD_LABELS[p.method] || p.method}
                      {p.reference ? ` · ${p.reference}` : ''}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(p.amount)}
                    </Typography>
                  </Stack>
                ))}
                {(!b.payments || b.payments.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No payments recorded.
                  </Typography>
                )}
                {b.changeReturned > 0 && (
                  <Line label="Change returned" value={formatCurrency(b.changeReturned)} color="success.main" />
                )}
              </Stack>
            </Box>

            {b.remarks && (
              <>
                <Divider />
                <Typography variant="body2">
                  <strong>Remarks:</strong> {b.remarks}
                </Typography>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      {b && (
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            startIcon={<PrintRoundedIcon />}
            onClick={() => onPrint?.(b._id)}
          >
            Print
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
