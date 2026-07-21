import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Chip, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, TextField,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PageHeader from '../../components/PageHeader.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import CustomerFormDialog from './CustomerFormDialog.jsx';
import * as customersApi from '../../api/customers.api.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { errorMessage } from '../../utils/format.js';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { debounced, page, limit }],
    queryFn: () =>
      customersApi.listCustomers({ search: debounced || undefined, page: page + 1, limit }),
    placeholderData: keepPreviousData,
  });

  const refetch = () => qc.invalidateQueries({ queryKey: ['customers'] });

  const del = useMutation({
    mutationFn: (id) => customersApi.deleteCustomer(id),
    onSuccess: () => {
      enqueueSnackbar('Customer deleted', { variant: 'info' });
      refetch();
      setDeleting(null);
    },
    onError: (e) => {
      enqueueSnackbar(errorMessage(e), { variant: 'error' });
      setDeleting(null);
    },
  });

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle="Customer directory"
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            Add customer
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search name or phone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{c.remarks || '—'}</TableCell>
                <TableCell>
                  <Chip size="small" label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setEditing(c); setFormOpen(true); }}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleting(c)}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No customers found
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

      <CustomerFormDialog open={formOpen} customer={editing} onClose={() => setFormOpen(false)} onSaved={refetch} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete customer"
        message={`Delete "${deleting?.name}"? Customers with bills can't be deleted.`}
        confirmText="Delete"
        loading={del.isPending}
        onConfirm={() => del.mutate(deleting._id)}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
}
