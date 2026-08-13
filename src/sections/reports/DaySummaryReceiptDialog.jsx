import dayjs from 'dayjs';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { formatCurrency, formatDate } from 'src/utils/format.js';
import { PAYMENT_METHOD_LABELS } from 'src/config/constants.js';
import { printReceipt } from 'src/utils/printReceipt.js';
import ReceiptLogo from 'src/components/ReceiptLogo.jsx';

// A single label/value line in the slip.
function Row({ label, value, bold }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ fontWeight: bold ? 800 : 600 }}>
      <Box component="span" sx={{ whiteSpace: 'nowrap' }}>{label}</Box>
      <Box component="span" sx={{ textAlign: 'right' }}>{value}</Box>
    </Stack>
  );
}

const Rule = () => <Box sx={{ borderTop: '1px dashed #000', my: 0.75 }} />;

function Heading({ children }) {
  return (
    <Typography component="div" sx={{ textAlign: 'center', fontWeight: 800, letterSpacing: 1, mt: 0.5 }}>
      {children}
    </Typography>
  );
}

// Printable day-end slip (thermal-receipt style). `summary` is the /reports
// day-summary payload; `user` is who is printing (for accountability).
export default function DaySummaryReceiptDialog({ open, onClose, summary, user }) {
  if (!summary) return null;
  const { sales, paymentsIn, totalCollected, returns, refundsOut, totalRefunded, net, bills, returnsList } = summary;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        className="no-print"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        Print day summary
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          className="receipt-area"
          sx={{
            fontFamily: "'Courier New', ui-monospace, monospace",
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.55,
            maxWidth: 320,
            mx: 'auto',
            color: 'common.black',
            bgcolor: 'common.white',
            p: 2,
          }}
        >
          <ReceiptLogo />
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700, fontSize: 13 }}>Piplod</Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700, mt: 0.5 }}>
            DAY SUMMARY
          </Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700 }}>
            {formatDate(summary.date)}
          </Typography>

          <Rule />
          <Heading>SALES</Heading>
          <Row label="Bills" value={sales.bills} />
          <Row label="Gross" value={formatCurrency(sales.gross)} />
          <Row label="Discount" value={`- ${formatCurrency(sales.discount)}`} />
          {sales.tax > 0 && <Row label="Tax" value={formatCurrency(sales.tax)} />}
          <Row label="Items sold" value={sales.itemsSold} />

          <Rule />
          <Heading>COLLECTED</Heading>
          {paymentsIn.length === 0 && <Row label="—" value={formatCurrency(0)} />}
          {paymentsIn.map((p) => (
            <Row key={p.method} label={PAYMENT_METHOD_LABELS[p.method] || p.method} value={formatCurrency(p.amount)} />
          ))}
          <Row label="Total in" value={formatCurrency(totalCollected)} bold />

          <Rule />
          <Heading>RETURNS</Heading>
          <Row label="Returns" value={returns.count} />
          <Row label="Items" value={`${returns.itemsReturned} (${returns.restocked} restock / ${returns.damaged} dmg)`} />
          <Row label="Refund credit" value={formatCurrency(returns.refundTotal)} />
          <Row label="Exchanges" value={returns.exchanges} />

          {totalRefunded > 0 && (
            <>
              <Rule />
              <Heading>REFUNDED OUT</Heading>
              {refundsOut.map((r) => (
                <Row key={r.method} label={PAYMENT_METHOD_LABELS[r.method] || r.method} value={formatCurrency(r.amount)} />
              ))}
              <Row label="Total out" value={formatCurrency(totalRefunded)} bold />
            </>
          )}

          <Rule />
          <Heading>NET</Heading>
          <Row label="Net revenue" value={formatCurrency(net.revenue)} bold />
          <Row label="Net in drawer" value={formatCurrency(net.inDrawer)} bold />

          {bills.length > 0 && (
            <>
              <Rule />
              <Heading>BILLS</Heading>
              {bills.map((b) => (
                <Row
                  key={b.billNumber}
                  label={`${b.billNumber}${b.isExchange ? ' (x)' : ''}`}
                  value={formatCurrency(b.total)}
                />
              ))}
            </>
          )}

          {returnsList.length > 0 && (
            <>
              <Rule />
              <Heading>RETURNS LIST</Heading>
              {returnsList.map((r) => (
                <Row key={r.returnNumber} label={r.returnNumber} value={`- ${formatCurrency(r.refundTotal)}`} />
              ))}
            </>
          )}

          <Rule />
          <Typography component="div" sx={{ textAlign: 'center', fontSize: 13, fontWeight: 700, mt: 0.5 }}>
            Printed {dayjs().format('DD MMM YYYY, hh:mm A')}
            {user?.name ? ` by ${user.name}` : ''}
          </Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
            {'*'.repeat(24)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions className="no-print" sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={() => printReceipt()}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
