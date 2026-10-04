import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  Box, Button, Card, CardContent, Grid, Paper, Stack, Tab, Table, TableBody, TableCell,
  TableHead, TablePagination, TableRow, Tabs,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoneyOffRoundedIcon from '@mui/icons-material/MoneyOffRounded';
import PageHeader from 'src/components/PageHeader';
import StatCard from 'src/components/StatCard';
import ExpenseFormDialog from 'src/sections/expenses/ExpenseFormDialog.jsx';
import * as expensesApi from 'src/api/expenses.api.js';
import { useAuth } from 'src/hooks/useAuth.js';
import { ROLE } from 'src/config/constants.js';
import { formatCurrency, formatDate, formatDateTime, formatNumber, todayIST } from 'src/utils/format.js';

const EmptyRow = ({ cols, show, text }) =>
  show ? (
    <TableRow>
      <TableCell colSpan={cols} align="center" sx={{ py: 4, color: 'text.secondary' }}>{text}</TableCell>
    </TableRow>
  ) : null;

export default function ExpensesPage() {
  const { role } = useAuth();
  const isSuper = role === ROLE.SUPERADMIN;
  const qc = useQueryClient();

  const [day, setDay] = useState(todayIST()); // admin: the single day being viewed
  const [from, setFrom] = useState(todayIST().startOf('month'));
  const [to, setTo] = useState(todayIST());
  const [tab, setTab] = useState('entries');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [formOpen, setFormOpen] = useState(false);

  // Admins see one day at a time; the range filter is superadmin-only.
  const params = isSuper
    ? {
        from: from ? from.format('YYYY-MM-DD') : undefined,
        to: to ? to.format('YYYY-MM-DD') : undefined,
      }
    : { date: day.format('YYYY-MM-DD') };
  const key = [params.from, params.to];

  const list = useQuery({
    queryKey: ['expenses', 'list', ...key, page, rowsPerPage],
    queryFn: () => expensesApi.listExpenses({ ...params, page: page + 1, limit: rowsPerPage }).then((r) => r),
  });
  const daily = useQuery({
    queryKey: ['expenses', 'daily', ...key],
    queryFn: () => expensesApi.getDailyExpenses(params).then((r) => r.data),
    enabled: isSuper && tab === 'daily',
  });
  const monthly = useQuery({
    queryKey: ['expenses', 'monthly', ...key],
    queryFn: () => expensesApi.getMonthlyExpenses(params).then((r) => r.data),
    enabled: isSuper && tab === 'monthly',
  });

  // Expenses also surface on the dashboard and day summary.
  const refetchAll = () => {
    qc.invalidateQueries({ queryKey: ['expenses'] });
    qc.invalidateQueries({ queryKey: ['dash'] });
    qc.invalidateQueries({ queryKey: ['day-summary'] });
  };

  const entries = list.data?.data || [];
  const total = list.data?.pagination?.total || 0;

  const changeRange = (setter) => (v) => {
    setter(v);
    setPage(0);
  };

  return (
    <Box>
      <PageHeader
        title="Expenses"
        subtitle="Shop expenses — tracked separately, never deducted from billing"
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {isSuper ? (
              <>
                <DatePicker label="From" value={from} onChange={changeRange(setFrom)} slotProps={{ textField: { size: 'small', sx: { width: 150 } } }} />
                <DatePicker label="To" value={to} onChange={changeRange(setTo)} slotProps={{ textField: { size: 'small', sx: { width: 150 } } }} />
              </>
            ) : (
              <DatePicker
                label="Day"
                value={day}
                onChange={(v) => { setDay(v || todayIST()); setPage(0); }}
                maxDate={todayIST()}
                slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
              />
            )}
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setFormOpen(true)}>
              Add expense
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label={isSuper ? 'Total expenses (selected range)' : 'Total expenses (day)'} value={formatCurrency(list.data?.totalAmount)} icon={<MoneyOffRoundedIcon />} color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Entries" value={formatNumber(total)} icon={<MoneyOffRoundedIcon />} color="warning" />
        </Grid>
      </Grid>

      <Card>
        {isSuper && (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
            <Tab value="entries" label="All entries" />
            <Tab value="daily" label="Day-wise" />
            <Tab value="monthly" label="Monthly" />
          </Tabs>
        )}
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {tab === 'entries' && (
            <Paper elevation={0} sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Added by</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e._id} hover>
                      <TableCell>{formatDateTime(e.createdAt)}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{e.reason}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{e.createdBy?.name || e.createdBy?.role || '—'}</TableCell>
                      <TableCell align="right">{formatCurrency(e.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <EmptyRow cols={4} show={!list.isLoading && entries.length === 0} text={isSuper ? 'No expenses in this range' : 'No expenses on this day'} />
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
                rowsPerPageOptions={[10, 20, 50, 100]}
              />
            </Paper>
          )}

          {tab === 'daily' && (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell align="right">Entries</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(daily.data || []).map((d) => (
                    <TableRow key={d.key} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{formatDate(d.key)}</TableCell>
                      <TableCell align="right">{d.count}</TableCell>
                      <TableCell align="right">{formatCurrency(d.total)}</TableCell>
                    </TableRow>
                  ))}
                  <EmptyRow cols={3} show={!daily.isLoading && (daily.data || []).length === 0} text="No expenses in this range" />
                </TableBody>
              </Table>
            </Box>
          )}

          {isSuper && tab === 'monthly' && (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Entries</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(monthly.data || []).map((m) => (
                    <TableRow key={m.key} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{dayjs(`${m.key}-01`).format('MMMM YYYY')}</TableCell>
                      <TableCell align="right">{m.count}</TableCell>
                      <TableCell align="right">{formatCurrency(m.total)}</TableCell>
                    </TableRow>
                  ))}
                  <EmptyRow cols={3} show={!monthly.isLoading && (monthly.data || []).length === 0} text="No expenses in this range" />
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <ExpenseFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={refetchAll} />
    </Box>
  );
}
