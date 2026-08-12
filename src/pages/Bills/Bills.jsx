import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Box, Chip, IconButton, InputAdornment, MenuItem, Paper, Stack, Table, TableBody, TableCell,
  TableHead, TablePagination, TableRow, TextField, Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PageHeader from 'src/components/PageHeader';
import BillDetailDialog from 'src/sections/bills/BillDetailDialog';
import BillReceiptDialog from 'src/sections/bills/BillReceiptDialog';
import * as billsApi from 'src/api/bills.api.js';
import { useDebounce } from 'src/hooks/useDebounce.js';
import { formatCurrency, formatDate } from 'src/utils/format.js';
import { PAYMENT_STATUS, PAYMENT_STATUS_COLOR } from 'src/config/constants.js';

export default function BillsPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [detailId, setDetailId] = useState(null);
  const [printId, setPrintId] = useState(null);

  const params = {
    search: debounced || undefined,
    paymentStatus: paymentStatus || undefined,
    from: from ? from.format('YYYY-MM-DD') : undefined,
    to: to ? to.format('YYYY-MM-DD') : undefined,
    page: page + 1,
    limit,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['bills', params],
    queryFn: () => billsApi.listBills(params),
    placeholderData: keepPreviousData,
  });

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const resetPage = () => setPage(0);

  return (
    <Box>
      <PageHeader title="Bills" subtitle="Sales history" />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search invoice, customer name or phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Payment"
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); resetPage(); }}
            sx={{ minWidth: { md: 150 } }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(PAYMENT_STATUS).map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="From"
            value={from}
            onChange={(v) => { setFrom(v); resetPage(); }}
            slotProps={{ textField: { size: 'small' }, field: { clearable: true } }}
          />
          <DatePicker
            label="To"
            value={to}
            onChange={(v) => { setTo(v); resetPage(); }}
            slotProps={{ textField: { size: 'small' }, field: { clearable: true } }}
          />
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell align="right">Print</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((b) => (
              <TableRow key={b._id} hover sx={{ cursor: 'pointer' }} onClick={() => setDetailId(b._id)}>
                <TableCell sx={{ fontWeight: 600 }}>{b.billNumber}</TableCell>
                <TableCell>{formatDate(b.createdAt)}</TableCell>
                <TableCell>{b.customerName || 'Walk-in'}</TableCell>
                <TableCell align="right">{b.items?.length || 0}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(b.total)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={PAYMENT_STATUS_COLOR[b.paymentStatus] || 'default'}
                    label={b.paymentStatus}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Print bill">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setPrintId(b._id); }}
                    >
                      <PrintRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No bills found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[20, 50, 100]}
        />
      </Paper>

      <BillDetailDialog
        billId={detailId}
        onClose={() => setDetailId(null)}
        onPrint={(id) => { setDetailId(null); setPrintId(id); }}
      />
      <BillReceiptDialog billId={printId} onClose={() => setPrintId(null)} />
    </Box>
  );
}
