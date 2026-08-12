import { useQuery } from '@tanstack/react-query';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import * as billsApi from 'src/api/bills.api.js';
import { formatCurrency, formatDateTime } from 'src/utils/format.js';
import { DISCOUNT_TYPE, PAYMENT_METHOD_LABELS } from 'src/config/constants.js';

// A single label/value line in the slip.
function Row({ label, value, bold }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ fontWeight: bold ? 700 : 400 }}>
      <Box component="span">{label}</Box>
      <Box component="span" sx={{ textAlign: 'right' }}>{value}</Box>
    </Stack>
  );
}

const Rule = () => <Box sx={{ borderTop: '1px dashed #000', my: 0.75 }} />;

// Printable invoice for a single bill (thermal-receipt style), matching the
// look of DaySummaryReceiptDialog. Reachable from the bills list (row print
// icon) or from BillDetailDialog ("Print" button).
export default function BillReceiptDialog({ billId, onClose }) {
  const open = Boolean(billId);
  const { data: b, isLoading } = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => billsApi.getBill(billId).then((r) => r.data),
    enabled: open,
  });

  const discountLabel = b
    ? b.discountType === DISCOUNT_TYPE.PERCENT
      ? `${b.discountValue}% (- ${formatCurrency(b.discount)})`
      : `- ${formatCurrency(b.discount)}`
    : '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Print bill
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading || !b ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Box
            className="receipt-area"
            sx={{
              fontFamily: "'Courier New', ui-monospace, monospace",
              fontSize: 13,
              lineHeight: 1.5,
              maxWidth: 320,
              mx: 'auto',
              color: 'common.black',
              bgcolor: 'common.white',
              p: 2,
            }}
          >
            <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700, fontSize: 16 }}>
              KIDZ PLAZA
            </Typography>
            <Typography component="div" sx={{ textAlign: 'center', fontSize: 12 }}>Piplod</Typography>
            <Typography component="div" sx={{ textAlign: 'center', mt: 0.5 }}>
              TAX INVOICE
            </Typography>

            <Rule />
            <Row label="Invoice" value={b.billNumber} bold />
            <Row label="Date" value={formatDateTime(b.createdAt)} />
            <Row label="Customer" value={b.customerName || 'Walk-in'} />
            {b.customerPhone && <Row label="Phone" value={b.customerPhone} />}

            <Rule />
            {(b.items || []).map((it, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Row
                key={i}
                label={`${it.productName}${it.size && it.size !== 'Free Size' ? ` (${it.size})` : ''}`}
                value={formatCurrency(it.mrp)}
              />
            ))}
            {(!b.items || b.items.length === 0) && <Row label="—" value="No item detail" />}

            <Rule />
            <Row label="Subtotal" value={formatCurrency(b.subtotal)} />
            <Row label="Discount" value={discountLabel} />
            {b.tax > 0 && <Row label="Tax" value={formatCurrency(b.tax)} />}
            <Row label="Total" value={formatCurrency(b.total)} bold />

            <Rule />
            {(b.payments || []).map((p, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Row
                key={i}
                label={PAYMENT_METHOD_LABELS[p.method] || p.method}
                value={formatCurrency(p.amount)}
              />
            ))}
            {(!b.payments || b.payments.length === 0) && <Row label="Amount paid" value={formatCurrency(b.amountPaid)} />}
            {b.changeReturned > 0 && <Row label="Change returned" value={formatCurrency(b.changeReturned)} />}

            {b.remarks && (
              <>
                <Rule />
                <Typography component="div" sx={{ fontSize: 12 }}>
                  Remarks: {b.remarks}
                </Typography>
              </>
            )}

            <Rule />
            <Typography component="div" sx={{ textAlign: 'center', fontSize: 11 }}>
              Thank you for shopping with us!
            </Typography>
            <Typography component="div" sx={{ textAlign: 'center', fontSize: 11 }}>
              {'*'.repeat(24)}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="no-print" sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} disabled={!b} onClick={() => window.print()}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
