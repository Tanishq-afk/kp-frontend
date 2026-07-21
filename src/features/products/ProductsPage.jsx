import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Box, Button, Chip, IconButton, InputAdornment, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableHead, TablePagination, TableRow, TextField,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PageHeader from '../../components/PageHeader.jsx';
import ProductDetailDialog from './ProductDetailDialog.jsx';
import * as productsApi from '../../api/products.api.js';
import * as categoriesApi from '../../api/categories.api.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatCurrency } from '../../utils/format.js';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [detailId, setDetailId] = useState(null);

  const cats = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesApi.listCategories({ limit: 100 }).then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', { debounced, category, page, limit }],
    queryFn: () =>
      productsApi.listProducts({
        search: debounced || undefined,
        category: category || undefined,
        page: page + 1,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle="Inventory catalog"
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/products/new')}>
            Add product
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search name or article number…"
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
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(0); }}
            sx={{ minWidth: { sm: 220 } }}
          >
            <MenuItem value="">All categories</MenuItem>
            {(cats.data || []).map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name} · {c.gender}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Article</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">MRP</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p._id} hover sx={{ cursor: 'pointer' }} onClick={() => setDetailId(p._id)}>
                <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                <TableCell>{p.articleNumber}</TableCell>
                <TableCell>{p.category?.name || '—'}</TableCell>
                <TableCell align="right">{formatCurrency(p.mrp)}</TableCell>
                <TableCell align="right">
                  <Chip size="small" label={p.currentStock} color={p.currentStock > 0 ? 'default' : 'warning'} />
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton size="small" onClick={() => setDetailId(p._id)}>
                    <VisibilityRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => navigate(`/products/${p._id}/edit`)}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No products found
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

      <ProductDetailDialog
        productId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(id) => navigate(`/products/${id}/edit`)}
        onDeleted={() => setDetailId(null)}
      />
    </Box>
  );
}
