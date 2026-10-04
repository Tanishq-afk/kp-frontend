import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Box, Button, Card, CardContent, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PageHeader from 'src/components/PageHeader';
import StatCard from 'src/components/StatCard';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import AccountStatementReceiptDialog from 'src/sections/reports/AccountStatementReceiptDialog.jsx';
import { useAuth } from 'src/hooks/useAuth.js';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import MoneyOffRoundedIcon from '@mui/icons-material/MoneyOffRounded';
import * as dashboardApi from 'src/api/dashboard.api.js';
import { formatCurrency, formatDate, todayIST } from 'src/utils/format.js';

// Account statement: day-wise net sale for a date range (default: the last month),
// then the total revenue, less expenses in the same range.
export default function AccountStatementPage() {
  const [from, setFrom] = useState(todayIST().subtract(1, 'month'));
  const [to, setTo] = useState(todayIST());
  const [printOpen, setPrintOpen] = useState(false);
  const { user } = useAuth();

  const badRange = Boolean(from && to && to.isBefore(from, 'day'));
  const params = {
    from: from ? from.format('YYYY-MM-DD') : undefined,
    to: to ? to.format('YYYY-MM-DD') : undefined,
  };
  const { data, isFetching } = useQuery({
    queryKey: ['account-statement', params],
    queryFn: () => dashboardApi.getAccountStatement(params).then((r) => r.data),
    enabled: Boolean(params.from && params.to) && !badRange,
    placeholderData: keepPreviousData,
  });

  const rows = data?.rows || [];
  const totals = data?.totals || {};

  return (
    <Box>
      <PageHeader
        title="Account Statement"
        subtitle="Day-wise net sale and revenue after expenses"
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <DatePicker label="From" value={from} onChange={setFrom} slotProps={{ textField: { size: 'small', sx: { width: 150 } } }} />
            <DatePicker label="To" value={to} onChange={setTo} slotProps={{ textField: { size: 'small', sx: { width: 150 } } }} />
            <Button
              variant="contained"
              startIcon={<PrintRoundedIcon />}
              disabled={rows.length === 0 || isFetching || badRange}
              onClick={() => setPrintOpen(true)}
            >
              Print
            </Button>
          </Stack>
        }
      />

      {badRange && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          The To date must be on or after the From date.
        </Typography>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StatCard label="Total revenue" value={formatCurrency(totals.netRevenue)} icon={<PaymentsRoundedIcon />} color="primary" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatCard label="Expenses" value={formatCurrency(totals.expenses)} icon={<MoneyOffRoundedIcon />} color="error" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatCard label="Revenue after expenses" value={formatCurrency(totals.revenueAfterExpenses)} icon={<AccountBalanceRoundedIcon />} color="success" />
        </Box>
      </Stack>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={70}>Sr. No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Net sale revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ opacity: isFetching ? 0.6 : 1 }}>
                {rows.map((r, i) => (
                  <TableRow key={r.date} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell align="right">{formatCurrency(r.netSale)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Choose a date range to see the statement
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
          {rows.length > 0 && (
            <>
              <Divider />
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Total revenue</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totals.netRevenue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>Less: expenses</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>- {formatCurrency(totals.expenses)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Revenue after expenses</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totals.revenueAfterExpenses)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
      {rows.length > 0 && (
        <AccountStatementReceiptDialog
          open={printOpen}
          onClose={() => setPrintOpen(false)}
          range={{ from: params.from, to: params.to }}
          rows={rows}
          totals={totals}
          user={user}
        />
      )}
    </Box>
  );
}
