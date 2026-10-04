import { useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { formatCurrency, formatDate, formatNumber, formatDateTime } from 'src/utils/format.js';
import { printReceipt } from 'src/utils/printReceipt.js';
import { printBillReceipt } from 'src/utils/printBillReceipt.js';
import ReceiptLogo from 'src/components/ReceiptLogo.jsx';

// A single label/value line in the slip. Bold for headings/key totals.
function Row({ label, value, bold }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ fontWeight: bold ? 700 : 400 }}>
      <Box component="span" sx={{ whiteSpace: 'nowrap' }}>{label}</Box>
      <Box component="span" sx={{ textAlign: 'right' }}>{value}</Box>
    </Stack>
  );
}

const Rule = () => <Box sx={{ borderTop: '1px dashed #000', my: 0.75 }} />;

function Heading({ children }) {
  return (
    <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700, letterSpacing: 1, mt: 0.5 }}>
      {children}
    </Typography>
  );
}

// Printable date-range report (thermal-receipt style) for the superadmin dashboard.
// `report` is the /dashboard/report payload; `user` is who is printing.
// Print goes through the same path as the bill receipt: raw to the saved receipt
// printer in the desktop app, otherwise the browser print dialog.
export default function RangeReportReceiptDialog({ open, onClose, report, user }) {
  const { enqueueSnackbar } = useSnackbar();
  const [printing, setPrinting] = useState(false);
  if (!report) return null;

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printBillReceipt(() => printReceipt());
    } catch (e) {
      enqueueSnackbar(`Print failed: ${e}`, { variant: 'error' });
    } finally {
      setPrinting(false);
    }
  };

  const { range, sales, returns, net, expenses } = report;

  const fromLabel = range.from ? formatDate(range.from) : 'Start';
  const toLabel = range.to ? formatDate(range.to) : 'Today';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        className="no-print"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        Print sales report
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          className="receipt-area"
          sx={{
            fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 1.5,
            // Must match print.css's .receipt-area width/padding (see
            // DaySummaryReceiptDialog / printReceipt.js).
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
            SALES REPORT
          </Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700 }}>
            {fromLabel} to {toLabel}
          </Typography>

          <Rule />
          <Row label="Total sale" value={formatCurrency(sales.gross)} />
          <Row label="Total return" value={`- ${formatCurrency(returns.refundTotal)}`} />

          <Rule />
          <Heading>COUNTS</Heading>
          <Row label="Total bills" value={formatNumber(sales.bills)} />
          <Row label="Items sold" value={formatNumber(sales.itemsSold)} />
          <Row label="Returned items" value={formatNumber(returns.itemsReturned)} />
          <Row label="Returns" value={formatNumber(returns.count)} />

          <Rule />
          <Row label="Net revenue" value={formatCurrency(net.revenue)} bold />

          <Rule />
          <Heading>EXPENSES</Heading>
          <Row label={`Expenses (${formatNumber(expenses.count)})`} value={formatCurrency(expenses.total)} />
          <Typography component="div" sx={{ textAlign: 'center', fontSize: 13, mt: 0.25 }}>
            Not deducted from net revenue
          </Typography>

          <Rule />
          <Typography component="div" sx={{ textAlign: 'center', fontSize: 15, fontWeight: 500, mt: 0.5 }}>
            Printed {formatDateTime(new Date())}
            {user?.name ? ` by ${user.name}` : ''}
          </Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontSize: 15, fontWeight: 500 }}>
            {'*'.repeat(24)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions className="no-print" sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} disabled={printing} onClick={handlePrint}>
          {printing ? 'Printing…' : 'Print'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
