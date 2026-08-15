import { Box, Stack, Typography } from '@mui/material';
import { formatCurrency, formatDateTime } from 'src/utils/format.js';
import { DISCOUNT_TYPE, PAYMENT_METHOD_LABELS } from 'src/config/constants.js';
import ReceiptLogo from 'src/components/ReceiptLogo.jsx';

// A single label/value line in the slip. `bold` for headings/key totals,
// `medium` for a slight emphasis (e.g. customer details), plain regular
// weight otherwise (matches the shop's real receipt — heavy bold everywhere
// looked muddy on the thermal print head).
function Row({ label, value, bold, medium }) {
  const weight = bold ? 700 : medium ? 600 : 400;
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ fontWeight: weight }}>
      <Box component="span">{label}</Box>
      <Box component="span" sx={{ textAlign: 'right' }}>{value}</Box>
    </Stack>
  );
}

const Rule = () => <Box sx={{ borderTop: '1px dashed #000', my: 0.75 }} />;

// The shop's standard return/exchange policy, printed on every bill.
const TERMS = [
  'No Return/No Exchange for Discounted Merchandise.',
  'Exchange within 3 Days from the Sale.',
  'No Cash Refund.',
  'M.R.P. inclusive of all Taxes.',
];

// The actual printable invoice markup (thermal-receipt style) — pulled out of
// BillReceiptDialog so it can be reused by the hidden print-only window
// (PrintBill page) without dragging along the Dialog/preview chrome.
export default function BillReceiptContent({ bill: b }) {
  const discountLabel = b
    ? b.discountType === DISCOUNT_TYPE.PERCENT
      ? `${b.discountValue}% (- ${formatCurrency(b.discount)})`
      : `- ${formatCurrency(b.discount)}`
    : '';

  return (
    <Box
      className="receipt-area"
      sx={{
        fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
        fontSize: 17,
        fontWeight: 400,
        lineHeight: 1.5,
        maxWidth: 340,
        mx: 'auto',
        color: 'common.black',
        bgcolor: 'common.white',
        p: 2,
      }}
    >
      <ReceiptLogo />
      <Typography component="div" sx={{ textAlign: 'center', fontWeight: 600, fontSize: 15 }}>Piplod</Typography>
      <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700, mt: 0.5 }}>
        TAX INVOICE
      </Typography>

      <Rule />
      <Row label="Bill No" value={b.billNumber} bold />
      <Row label="Date & Time" value={formatDateTime(b.createdAt)} />
      <Row label="Customer" value={b.customerName || 'Walk-in'} medium />
      {b.customerPhone && <Row label="Contact No" value={b.customerPhone} medium />}

      <Rule />
      <Stack direction="row" spacing={1} sx={{ fontWeight: 700, fontSize: 18 }}>
        <Box component="span" sx={{ width: 24 }}>Sr.</Box>
        <Box component="span" sx={{ flex: 1 }}>Item Name</Box>
        <Box component="span" sx={{ width: 30, textAlign: 'right' }}>Qty</Box>
        <Box component="span" sx={{ width: 76, textAlign: 'right' }}>Price</Box>
      </Stack>
      <Rule />
      {(b.items || []).map((it, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Stack key={i} direction="row" spacing={1} sx={{ mb: 0.75, fontWeight: 500, fontSize: 18 }}>
          <Box component="span" sx={{ width: 24 }}>{i + 1}</Box>
          <Box component="span" sx={{ flex: 1 }}>
            {it.productName}
            {it.size && it.size !== 'Free Size' ? ` (${it.size})` : ''}
          </Box>
          <Box component="span" sx={{ width: 30, textAlign: 'right' }}>1</Box>
          <Box component="span" sx={{ width: 76, textAlign: 'right' }}>{formatCurrency(it.mrp)}</Box>
        </Stack>
      ))}
      {(!b.items || b.items.length === 0) && <Row label="—" value="No item detail" />}

      <Rule />
      <Row label="Total" value={formatCurrency(b.subtotal)} />
      <Row label="Discount" value={discountLabel} />
      <Row label="Additional Charges" value={formatCurrency(b.tax)} />
      <Row label="Final Amount" value={formatCurrency(b.total)} bold />

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
          <Typography component="div" sx={{ fontSize: 15, fontWeight: 400 }}>
            Remarks: {b.remarks}
          </Typography>
        </>
      )}

      <Rule />
      <Typography component="div" sx={{ fontWeight: 700 }}>Terms and Conditions:</Typography>
      {TERMS.map((t, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Typography key={i} component="div" sx={{ fontSize: 15, fontWeight: 400 }}>
          {i + 1}) {t}
        </Typography>
      ))}

      <Rule />
      <Typography component="div" sx={{ textAlign: 'center', fontSize: 15, fontWeight: 500 }}>
        Thank you for shopping with us!
      </Typography>
      <Typography component="div" sx={{ textAlign: 'center', fontSize: 15, fontWeight: 500 }}>
        {'*'.repeat(24)}
      </Typography>
    </Box>
  );
}
