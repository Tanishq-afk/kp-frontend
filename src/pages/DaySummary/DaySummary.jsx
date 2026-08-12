import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import AssignmentReturnRoundedIcon from '@mui/icons-material/AssignmentReturnRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PageHeader from 'src/components/PageHeader';
import StatCard from 'src/components/StatCard';
import DaySummaryReceiptDialog from 'src/sections/reports/DaySummaryReceiptDialog.jsx';
import * as reportsApi from 'src/api/reports.api.js';
import { useAuth } from 'src/hooks/useAuth.js';
import { formatCurrency, formatNumber } from 'src/utils/format.js';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_COLOR } from 'src/config/constants.js';

function Line({ label, value, strong, color }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
      <Typography variant={strong ? 'subtitle2' : 'body2'} color={color || 'text.secondary'}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={strong ? 700 : 600} color={color}>
        {value}
      </Typography>
    </Stack>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>{title}</Typography>
        <Stack spacing={1}>{children}</Stack>
      </CardContent>
    </Card>
  );
}

export default function DaySummaryPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(dayjs());
  const [printOpen, setPrintOpen] = useState(false);

  const dateStr = date ? date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
  const { data, isLoading } = useQuery({
    queryKey: ['day-summary', dateStr],
    queryFn: () => reportsApi.getDaySummary({ date: dateStr }).then((r) => r.data),
  });

  const s = data;
  const sales = s?.sales || {};
  const returns = s?.returns || {};
  const net = s?.net || {};

  return (
    <Box>
      <PageHeader
        title="Day Summary"
        subtitle="Complete sales & returns for a single day"
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
            <DatePicker
              label="Date"
              value={date}
              onChange={(v) => setDate(v || dayjs())}
              maxDate={dayjs()}
              slotProps={{ textField: { size: 'small', sx: { width: 170 } } }}
            />
            <Button
              variant="contained"
              startIcon={<PrintRoundedIcon />}
              disabled={isLoading || !s}
              onClick={() => setPrintOpen(true)}
            >
              Print summary
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Gross sales" value={formatCurrency(sales.gross)} icon={<PaymentsRoundedIcon />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Refunds" value={formatCurrency(returns.refundTotal)} icon={<AssignmentReturnRoundedIcon />} color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Net revenue" value={formatCurrency(net.revenue)} icon={<TrendingUpRoundedIcon />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Net in drawer" value={formatCurrency(net.inDrawer)} icon={<AccountBalanceWalletRoundedIcon />} color="info" />
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionCard title="Sales">
            <Line label="Bills" value={formatNumber(sales.bills)} />
            <Line label="Gross" value={formatCurrency(sales.gross)} />
            <Line label="Discount" value={`- ${formatCurrency(sales.discount)}`} />
            {sales.tax > 0 && <Line label="Tax" value={formatCurrency(sales.tax)} />}
            <Line label="Items sold" value={formatNumber(sales.itemsSold)} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionCard title="Money collected">
            {(s?.paymentsIn || []).map((p) => (
              <Line key={p.method} label={PAYMENT_METHOD_LABELS[p.method] || p.method} value={formatCurrency(p.amount)} />
            ))}
            {(s?.paymentsIn || []).length === 0 && <Typography variant="body2" color="text.secondary">No payments.</Typography>}
            <Divider />
            <Line label="Total in" value={formatCurrency(s?.totalCollected)} strong />
            {s?.totalRefunded > 0 && (
              <>
                {(s?.refundsOut || []).map((r) => (
                  <Line key={r.method} label={`Refund · ${PAYMENT_METHOD_LABELS[r.method] || r.method}`} value={`- ${formatCurrency(r.amount)}`} color="error.main" />
                ))}
                <Line label="Total out" value={`- ${formatCurrency(s?.totalRefunded)}`} color="error.main" />
              </>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionCard title="Returns">
            <Line label="Returns" value={formatNumber(returns.count)} />
            <Line label="Items returned" value={formatNumber(returns.itemsReturned)} />
            <Line label="Restocked" value={formatNumber(returns.restocked)} />
            <Line label="Damaged" value={formatNumber(returns.damaged)} />
            <Line label="Exchanges" value={formatNumber(returns.exchanges)} />
            <Divider />
            <Line label="Refund credit" value={formatCurrency(returns.refundTotal)} strong color="error.main" />
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Bills</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Items</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Payment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(s?.bills || []).map((b) => (
                      <TableRow key={b.billNumber}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {b.billNumber}
                          {b.isExchange && <Chip size="small" label="exchange" sx={{ ml: 0.5 }} />}
                        </TableCell>
                        <TableCell>{b.customerName || 'Walk-in'}</TableCell>
                        <TableCell align="right">{b.items}</TableCell>
                        <TableCell align="right">{formatCurrency(b.total)}</TableCell>
                        <TableCell>
                          <Chip size="small" color={PAYMENT_STATUS_COLOR[b.paymentStatus] || 'default'} label={b.paymentStatus} sx={{ textTransform: 'capitalize' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && (s?.bills || []).length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>No bills on this day</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Returns</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Return</TableCell>
                      <TableCell>Bill</TableCell>
                      <TableCell align="right">Refund</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(s?.returnsList || []).map((r) => (
                      <TableRow key={r.returnNumber}>
                        <TableCell sx={{ fontWeight: 600 }}>{r.returnNumber}</TableCell>
                        <TableCell>{r.originalBillNumber || '—'}</TableCell>
                        <TableCell align="right">{formatCurrency(r.refundTotal)}</TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && (s?.returnsList || []).length === 0 && (
                      <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>No returns on this day</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DaySummaryReceiptDialog open={printOpen} onClose={() => setPrintOpen(false)} summary={s} user={user} />
    </Box>
  );
}
