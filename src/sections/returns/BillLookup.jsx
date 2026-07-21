import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Box, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import * as returnsApi from 'src/api/returns.api.js';
import { useDebounce } from 'src/hooks/useDebounce.js';
import { formatCurrency, formatDate } from 'src/utils/format.js';

// Step 1 of a return: find the original bill by invoice number or customer phone,
// then click a row to load its items.
export default function BillLookup({ onPick, picking }) {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);

  const params = { search: debounced || undefined, limit: 15 };
  const { data, isLoading } = useQuery({
    queryKey: ['returns-lookup', params],
    queryFn: () => returnsApi.lookupBills(params),
    placeholderData: keepPreviousData,
  });

  const bills = data?.data || [];

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Search by invoice number or customer phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
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
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((b) => (
              <TableRow
                key={b._id}
                hover
                sx={{ cursor: picking ? 'wait' : 'pointer' }}
                onClick={() => !picking && onPick(b._id)}
              >
                <TableCell sx={{ fontWeight: 600 }}>{b.billNumber}</TableCell>
                <TableCell>{formatDate(b.createdAt)}</TableCell>
                <TableCell>
                  {b.customerName || 'Walk-in'}
                  {b.customerPhone ? (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {b.customerPhone}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell align="right">{b.items?.length || 0}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(b.total)}</TableCell>
              </TableRow>
            ))}
            {!isLoading && bills.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
                    <ReceiptLongRoundedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography variant="subtitle1">No matching bills</Typography>
                    <Typography variant="body2">
                      Search a completed bill by its invoice number or the customer&apos;s phone.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
