import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Box, Chip, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, TextField, Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReturnDetailDialog from './ReturnDetailDialog.jsx';
import * as returnsApi from 'src/api/returns.api.js';
import { useDebounce } from 'src/hooks/useDebounce.js';
import { formatCurrency, formatDate } from 'src/utils/format.js';

const DIRECTION_COLOR = { collect: 'warning', refund: 'success', even: 'default' };
const DIRECTION_LABEL = { collect: 'Collected', refund: 'Refunded', even: 'Even' };

export default function ReturnsHistory() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [detailId, setDetailId] = useState(null);

  const params = {
    search: debounced || undefined,
    from: from ? from.format('YYYY-MM-DD') : undefined,
    to: to ? to.format('YYYY-MM-DD') : undefined,
    page: page + 1,
    limit,
  };
  const resetPage = () => setPage(0);

  const { data, isLoading } = useQuery({
    queryKey: ['returns', params],
    queryFn: () => returnsApi.listReturns(params),
    placeholderData: keepPreviousData,
  });

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search return no., original invoice, customer name or phone…"
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
          <DatePicker label="From" value={from} onChange={(v) => { setFrom(v); resetPage(); }} slotProps={{ textField: { size: 'small' }, field: { clearable: true } }} />
          <DatePicker label="To" value={to} onChange={(v) => { setTo(v); resetPage(); }} slotProps={{ textField: { size: 'small' }, field: { clearable: true } }} />
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Return</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Original bill</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Refund</TableCell>
              <TableCell>Settlement</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((r) => (
              <TableRow key={r._id} hover sx={{ cursor: 'pointer' }} onClick={() => setDetailId(r._id)}>
                <TableCell sx={{ fontWeight: 600 }}>{r.returnNumber}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell>{r.originalBillNumber || '—'}</TableCell>
                <TableCell>{r.customerName || 'Walk-in'}</TableCell>
                <TableCell align="right">{r.items?.length || 0}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(r.refundTotal)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={DIRECTION_COLOR[r.settlement?.direction] || 'default'}
                    label={`${DIRECTION_LABEL[r.settlement?.direction] || '—'} ${formatCurrency(r.settlement?.amount)}`}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No returns found</Typography>
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

      <ReturnDetailDialog returnId={detailId} onClose={() => setDetailId(null)} />
    </Box>
  );
}
