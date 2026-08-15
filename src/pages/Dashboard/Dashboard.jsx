import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  Box, Card, CardContent, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import PageHeader from 'src/components/PageHeader';
import StatCard from 'src/components/StatCard';
import * as dashboardApi from 'src/api/dashboard.api.js';
import { formatCurrency, formatNumber } from 'src/utils/format.js';
import { PAYMENT_METHOD_LABELS } from 'src/config/constants.js';

const PIE_COLORS = ['#A2FF00', '#8133F1', '#00B8D9', '#00A76F', '#FFAB00', '#EB6262'];

function ChartCard({ title, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function NoData() {
  return (
    <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
      <Typography variant="body2">No sales in this range.</Typography>
    </Box>
  );
}

export default function DashboardPage() {
  const [from, setFrom] = useState(dayjs().subtract(29, 'day'));
  const [to, setTo] = useState(dayjs());

  const params = {
    from: from ? from.format('YYYY-MM-DD') : undefined,
    to: to ? to.format('YYYY-MM-DD') : undefined,
  };
  const key = [params.from, params.to];

  const summary = useQuery({ queryKey: ['dash', 'summary', ...key], queryFn: () => dashboardApi.getSummary(params).then((r) => r.data) });
  const daily = useQuery({ queryKey: ['dash', 'daily', ...key], queryFn: () => dashboardApi.getDailySales(params).then((r) => r.data) });
  const payments = useQuery({ queryKey: ['dash', 'payments', ...key], queryFn: () => dashboardApi.getPaymentMethods(params).then((r) => r.data) });
  const topProducts = useQuery({ queryKey: ['dash', 'top', ...key], queryFn: () => dashboardApi.getTopProducts({ ...params, limit: 8 }).then((r) => r.data) });
  const byCategory = useQuery({ queryKey: ['dash', 'cat', ...key], queryFn: () => dashboardApi.getSalesByCategory(params).then((r) => r.data) });

  const totals = summary.data?.totals || {};
  const today = summary.data?.today || {};
  const dailyRows = daily.data || [];
  const paymentRows = payments.data || [];
  const categoryRows = byCategory.data || [];
  const topRows = topProducts.data || [];

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Sales overview"
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <DatePicker label="From" value={from} onChange={setFrom} slotProps={{ textField: { size: 'small', sx: { width: 150 } } }} />
            <DatePicker label="To" value={to} onChange={setTo} slotProps={{ textField: { size: 'small', sx: { width: 150 } } }} />
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Revenue" value={formatCurrency(totals.revenue)} icon={<PaymentsRoundedIcon />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Bills" value={formatNumber(totals.bills)} icon={<ReceiptLongRoundedIcon />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Items sold" value={formatNumber(totals.itemsSold)} icon={<ShoppingBagRoundedIcon />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Today" value={formatCurrency(today.revenue)} icon={<TodayRoundedIcon />} color="success" />
        </Grid>

        <Grid item xs={12} md={8}>
          <ChartCard title="Day-wise sales">
            {dailyRows.length === 0 ? (
              <NoData />
            ) : (
              <LineChart
                height={300}
                xAxis={[{
                  scaleType: 'point',
                  data: dailyRows.map((d) => d.date),
                  valueFormatter: (v) => dayjs(v).format('DD MMM'),
                }]}
                series={[{
                  data: dailyRows.map((d) => d.revenue),
                  label: 'Revenue',
                  area: true,
                  color: '#A2FF00',
                  showMark: false,
                }]}
                margin={{ left: 72 }}
              />
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ChartCard title="Payment methods">
            {paymentRows.length === 0 ? (
              <NoData />
            ) : (
              <PieChart
                height={300}
                series={[{
                  innerRadius: 50,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  data: paymentRows.map((p, i) => ({
                    id: i,
                    value: p.amount,
                    label: PAYMENT_METHOD_LABELS[p.method] || p.method,
                    color: PIE_COLORS[i % PIE_COLORS.length],
                  })),
                }]}
              />
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <ChartCard title="Sales by category">
            {categoryRows.length === 0 ? (
              <NoData />
            ) : (
              <Box sx={{ mt: 3 }}>
                <PieChart
                  height={400}
                  series={[{
                    paddingAngle: 1,
                    cx: '50%',
                    cy: '42%',
                    data: categoryRows.slice(0, 8).map((c, i) => ({
                      id: i,
                      value: c.revenue,
                      label: c.categoryName || 'Uncategorized',
                      color: PIE_COLORS[i % PIE_COLORS.length],
                    })),
                  }]}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'middle' },
                      itemGap: 12,
                      labelStyle: { fontSize: 12 },
                    },
                  }}
                  margin={{ top: 40, bottom: 90, left: 10, right: 10 }}
                />
              </Box>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <ChartCard title="Top products">
            <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topRows.map((p) => (
                  <TableRow key={p.product}>
                    <TableCell>{p.productName}</TableCell>
                    <TableCell align="right">{p.qty}</TableCell>
                    <TableCell align="right">{formatCurrency(p.revenue)}</TableCell>
                  </TableRow>
                ))}
                {topRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No sales in this range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
