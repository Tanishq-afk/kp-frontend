import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Box, Card, CardContent, Chip, Grid, InputAdornment, MenuItem, Paper, Stack, Tab, Table,
  TableBody, TableCell, TableHead, TablePagination, TableRow, Tabs, TextField, Typography,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RemoveShoppingCartRoundedIcon from '@mui/icons-material/RemoveShoppingCartRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PageHeader from 'src/components/PageHeader';
import StatCard from 'src/components/StatCard';
import * as dashboardApi from 'src/api/dashboard.api.js';
import * as productsApi from 'src/api/products.api.js';
import * as categoriesApi from 'src/api/categories.api.js';
import { useDebounce } from 'src/hooks/useDebounce.js';
import { formatCurrency, formatNumber } from 'src/utils/format.js';

const PIE_COLORS = ['#A2FF00', '#8133F1', '#00B8D9', '#00A76F', '#FFAB00', '#EB6262'];

// "in"/"out" only — see the conversation: this catalog is ~entirely 1-unit-max
// per product, so a separate "low stock" bucket would just duplicate "in
// stock" for virtually everything. Kept generically correct on the backend,
// just not confusing the UI with a bucket that's never actually distinct yet.
const STOCK_TABS = [
  { value: '', label: 'All' },
  { value: 'in', label: 'In Stock' },
  { value: 'out', label: 'Out of Stock' },
];

// Superadmin-only, read-only inventory oversight: KPIs, a per-category
// breakdown (chart + table), and a searchable/filterable stock list. No
// write actions here — that's the admin's Products page.
export default function StockPage() {
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);

  const cats = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesApi.listCategories({ limit: 100 }).then((r) => r.data),
  });
  const summary = useQuery({
    queryKey: ['stock', 'summary'],
    queryFn: () => dashboardApi.getStockSummary().then((r) => r.data),
  });
  const byCategory = useQuery({
    queryKey: ['stock', 'byCategory'],
    queryFn: () => dashboardApi.getStockByCategory().then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['stock', 'products', { tab, debounced, category, page, limit }],
    queryFn: () =>
      productsApi.listProducts({
        stockStatus: tab || undefined,
        search: debounced || undefined,
        category: category || undefined,
        page: page + 1,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const s = summary.data || {};
  const catRows = byCategory.data || [];
  const resetPage = () => setPage(0);

  return (
    <Box>
      <PageHeader title="Stock" subtitle="Inventory overview" />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Products" value={formatNumber(s.totalProducts)} icon={<Inventory2RoundedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Units In Stock"
            value={formatNumber(s.totalUnitsInStock)}
            icon={<CheckCircleRoundedIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Out of Stock"
            value={formatNumber(s.outOfStock)}
            icon={<RemoveShoppingCartRoundedIcon />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Inventory Value (cost)"
            value={formatCurrency(s.inventoryCostValue)}
            icon={<PaymentsRoundedIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Stock by Category
              </Typography>
              {catRows.length > 0 ? (
                <Box sx={{ mt: 3 }}>
                  <PieChart
                    series={[
                      {
                        data: catRows.slice(0, 8).map((c, i) => ({
                          id: i,
                          value: c.totalStock,
                          label: c.categoryName || 'Uncategorized',
                          color: PIE_COLORS[i % PIE_COLORS.length],
                        })),
                        innerRadius: 40,
                        cx: '50%',
                        cy: '42%',
                      },
                    ]}
                    height={400}
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
              ) : (
                <Typography color="text.secondary">No stock data.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                By Category
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Products</TableCell>
                      <TableCell align="right">In Stock</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {catRows.map((c) => (
                      <TableRow key={c.category || 'none'}>
                        <TableCell>{c.categoryName || 'Uncategorized'}</TableCell>
                        <TableCell align="right">{formatNumber(c.productCount)}</TableCell>
                        <TableCell align="right">{formatNumber(c.totalStock)}</TableCell>
                        <TableCell align="right">{formatCurrency(c.inventoryValue)}</TableCell>
                      </TableRow>
                    ))}
                    {catRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); resetPage(); }} sx={{ px: 2 }}>
          {STOCK_TABS.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search name or article number…"
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
            label="Category"
            value={category}
            onChange={(e) => { setCategory(e.target.value); resetPage(); }}
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
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p._id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                <TableCell>{p.articleNumber}</TableCell>
                <TableCell>{p.category?.name || '—'}</TableCell>
                <TableCell align="right">{formatCurrency(p.mrp)}</TableCell>
                <TableCell align="right">
                  <Chip
                    size="small"
                    label={p.currentStock > 0 ? `${p.currentStock} in stock` : 'Out of stock'}
                    color={p.currentStock > 0 ? 'success' : 'default'}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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
          onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value, 10)); resetPage(); }}
          rowsPerPageOptions={[20, 50, 100]}
        />
      </Paper>
    </Box>
  );
}
