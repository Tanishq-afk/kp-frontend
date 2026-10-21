import { Box, Stack, Typography } from '@mui/material';
import { formatCurrency, formatDateTime } from 'src/utils/format.js';
import { PAYMENT_METHOD_LABELS } from 'src/config/constants.js';
import ReceiptLogo from 'src/components/ReceiptLogo.jsx';
import { Row, Rule } from 'src/sections/bills/BillReceiptContent.jsx';

const DIRECTION_LABEL = {
  collect: 'Collected from customer',
  refund: 'Refunded to customer',
  even: 'Settled - nothing due',
};

// Printable return / exchange slip (credit note), styled like the bill slip
// (BillReceiptContent) and using the same .receipt-area class and 80mm width,
// so printBillReceipt / printReceipt measure and print it the same way.
export default function ReturnReceiptContent({ ret: r }) {
  const dir = r.settlement?.direction;

  return (
    <Box
      className="receipt-area"
      sx={{
        fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
        fontSize: 17,
        fontWeight: 400,
        lineHeight: 1.5,
        // Must match print.css's .receipt-area width/padding (see BillReceiptContent).
        width: '80mm',
        mx: 'auto',
        color: 'common.black',
        bgcolor: 'common.white',
        padding: '4mm',
      }}
    >
      <ReceiptLogo />
      <Typography component="div" sx={{ textAlign: 'center', fontWeight: 600, fontSize: 15 }}>Piplod</Typography>
      <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700, mt: 0.5 }}>
        RETURN SLIP
      </Typography>

      <Rule />
      <Row label="Return No" value={r.returnNumber} bold />
      <Row label="Date" value={formatDateTime(r.createdAt)} />
      <Row label="Against Bill" value={r.originalBill?.billNumber || r.originalBillNumber || '—'} />
      {r.exchangeBill?.billNumber && <Row label="Exchange Bill" value={r.exchangeBill.billNumber} />}
      <Row label="Customer" value={r.customerName || 'Walk-in'} medium />
      {r.customerPhone && <Row label="Contact No" value={r.customerPhone} medium />}

      <Rule />
      <Stack direction="row" spacing={1} sx={{ fontWeight: 700, fontSize: 18 }}>
        <Box component="span" sx={{ width: 24 }}>Sr.</Box>
        <Box component="span" sx={{ flex: 1 }}>Item Returned</Box>
        <Box component="span" sx={{ width: 76, textAlign: 'right' }}>Credit</Box>
      </Stack>
      <Rule />
      {(r.items || []).map((it, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Stack key={i} direction="row" spacing={1} sx={{ fontWeight: 500, fontSize: 18, mb: 0.75 }}>
          <Box component="span" sx={{ width: 24 }}>{i + 1}</Box>
          <Box component="span" sx={{ flex: 1 }}>
            {it.productName}
            {it.size && it.size !== 'Free Size' ? ` (${it.size})` : ''}
          </Box>
          <Box component="span" sx={{ width: 76, textAlign: 'right' }}>{formatCurrency(it.refundAmount)}</Box>
        </Stack>
      ))}

      <Rule />
      <Row label="Return Credit" value={formatCurrency(r.refundTotal)} />
      {r.dueAdjusted > 0 && <Row label="Adjusted to Balance Due" value={`- ${formatCurrency(r.dueAdjusted)}`} />}
      {r.exchangeTotal > 0 && <Row label="Exchange Purchase" value={formatCurrency(r.exchangeTotal)} />}
      <Row label={DIRECTION_LABEL[dir] || 'Settled'} value={formatCurrency(r.settlement?.amount)} bold />
      {(r.settlement?.payments || []).map((p, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Row
          key={i}
          label={`Refund - ${PAYMENT_METHOD_LABELS[p.method] || p.method}`}
          value={formatCurrency(p.amount)}
        />
      ))}
      <Typography component="div" sx={{ textAlign: 'center', fontSize: 15, fontWeight: 500, mt: 0.5 }}>
        All prices are inclusive of GST.
      </Typography>

      {/* Remarks are internal notes: never printed on the customer's slip (same as bills). */}
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
