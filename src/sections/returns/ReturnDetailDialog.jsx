import { useQuery } from '@tanstack/react-query';
import {
  Box, Chip, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useIsMobile } from 'src/hooks/useIsMobile.js';
import * as returnsApi from 'src/api/returns.api.js';
import { formatCurrency, formatDateTime } from 'src/utils/format.js';

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

const DIRECTION = {
  collect: { label: 'Collected from customer', color: 'warning' },
  refund: { label: 'Refunded to customer', color: 'success' },
  even: { label: 'Settled — nothing due', color: 'default' },
};

export default function ReturnDetailDialog({ returnId, onClose }) {
  const open = Boolean(returnId);
  const isMobile = useIsMobile();
  const { data: r, isLoading } = useQuery({
    queryKey: ['return', returnId],
    queryFn: () => returnsApi.getReturn(returnId).then((res) => res.data),
    enabled: open,
  });

  const dir = DIRECTION[r?.settlement?.direction] || DIRECTION.even;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {r?.returnNumber || 'Return'}
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading || !r ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Box>
                <Typography fontWeight={600}>{r.customerName || 'Walk-in'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {r.customerPhone || '—'} · {formatDateTime(r.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Against {r.originalBill?.billNumber || r.originalBillNumber}
                </Typography>
                {r.exchangeBill && (
                  <Typography variant="caption" color="text.secondary">
                    Exchange {r.exchangeBill.billNumber}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell align="right">Refund</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {r.items.map((it, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <TableRow key={i}>
                    <TableCell>{it.productName}</TableCell>
                    <TableCell>{it.size}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={it.resellable ? 'success' : 'error'}
                        variant="outlined"
                        label={it.resellable ? 'Resellable' : 'Damaged'}
                      />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(it.refundAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider />
            <Stack spacing={1}>
              <Line label="Return credit" value={formatCurrency(r.refundTotal)} color="success.main" />
              {r.exchangeTotal > 0 && <Line label="Exchange (new items)" value={formatCurrency(r.exchangeTotal)} />}
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">{dir.label}</Typography>
                <Chip color={dir.color} label={formatCurrency(r.settlement?.amount)} />
              </Stack>
            </Stack>

            {r.settlement?.payments?.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Refund paid</Typography>
                  <Stack spacing={0.5}>
                    {r.settlement.payments.map((p, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Stack key={i} direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{p.method}</Typography>
                        <Typography variant="body2" fontWeight={600}>{formatCurrency(p.amount)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            {r.remarks && (
              <>
                <Divider />
                <Typography variant="body2"><strong>Remarks:</strong> {r.remarks}</Typography>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
