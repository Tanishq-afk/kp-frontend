import { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ReceiptLogo from 'src/components/ReceiptLogo.jsx';
import { printReceipt } from 'src/utils/printReceipt.js';
import { printBillReceipt } from 'src/utils/printBillReceipt.js';
import { formatCurrency, formatDate, formatDateTime } from 'src/utils/format.js';

const Rule = () => <Box sx={{ borderTop: '1px dashed #000', my: 0.75 }} />;

// A label/value line in the slip; bold for totals.
function Row({ label, value, bold }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ fontWeight: bold ? 700 : 400, fontSize: 15 }}>
      <Box component="span" sx={{ whiteSpace: 'nowrap' }}>{label}</Box>
      <Box component="span" sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{value}</Box>
    </Stack>
  );
}

// Printable account statement (thermal-receipt style): day-wise net sale with
// the totals, then expenses and revenue after expenses. `rows` / `totals` are the
// same data the page shows; printed through the bill receipt path.
export default function AccountStatementReceiptDialog({ open, onClose, range, rows, totals, user }) {
  const { enqueueSnackbar } = useSnackbar();
  const [printing, setPrinting] = useState(false);

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        className="no-print"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        Print account statement
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
            // Must match print.css's .receipt-area width/padding (see printReceipt.js).
            width: '80mm',
            mx: 'auto',
            color: 'common.black',
            bgcolor: 'common.white',
            padding: '4mm',
          }}
        >
          <ReceiptLogo />
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 600, fontSize: 15 }}>Piplod</Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700, mt: 0.5 }}>ACCOUNT STATEMENT</Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700 }}>
            {formatDate(range.from)} to {formatDate(range.to)}
          </Typography>

          <Rule />
          <Stack direction="row" justifyContent="space-between" sx={{ fontSize: 15, fontWeight: 700 }}>
            <Box component="span">Sr  Date</Box>
            <Box component="span">Net sale</Box>
          </Stack>
          {rows.map((r, i) => (
            <Stack key={r.date} direction="row" justifyContent="space-between" spacing={1} sx={{ fontSize: 15 }}>
              <Box component="span" sx={{ whiteSpace: 'nowrap' }}>{i + 1}.  {formatDate(r.date)}</Box>
              <Box component="span" sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatCurrency(r.netSale)}</Box>
            </Stack>
          ))}

          <Rule />
          <Row label="Total revenue" value={formatCurrency(totals.netRevenue)} bold />
          <Row label="Less: expenses" value={`- ${formatCurrency(totals.expenses)}`} />
          <Rule />
          <Row label="Revenue after expenses" value={formatCurrency(totals.revenueAfterExpenses)} bold />

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
