import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Chip, IconButton, InputAdornment, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, TextField,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PageHeader from '../../components/PageHeader.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import CategoryFormDialog from './CategoryFormDialog.jsx';
import * as categoriesApi from '../../api/categories.api.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { errorMessage } from '../../utils/format.js';

export default function CategoriesPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading } = useQuery({
    queryKey: ['categories', debounced],
    queryFn: () =>
      categoriesApi.listCategories({ search: debounced || undefined, limit: 100 }).then((r) => r.data),
  });

  const refetch = () => qc.invalidateQueries({ queryKey: ['categories'] });

  const del = useMutation({
    mutationFn: (id) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      enqueueSnackbar('Category deleted', { variant: 'info' });
      refetch();
      setDeleting(null);
    },
    onError: (e) => {
      enqueueSnackbar(errorMessage(e), { variant: 'error' });
      setDeleting(null);
    },
  });

  const rows = data || [];

  return (
    <Box>
      <PageHeader
        title="Categories"
        subtitle="Manage product categories"
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add category
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search categories…"
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
              <TableCell>Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                <TableCell>{c.gender}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={c.isActive ? 'Active' : 'Inactive'}
                    color={c.isActive ? 'success' : 'default'}
                  />
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
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
        onSaved={refetch}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete category"
        message={`Delete "${deleting?.name}"? Categories in use can't be deleted.`}
        confirmText="Delete"
        loading={del.isPending}
        onConfirm={() => del.mutate(deleting._id)}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
}
