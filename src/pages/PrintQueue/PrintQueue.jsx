import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TablePagination,
  TableRow,
} from '@mui/material';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PageHeader from 'src/components/PageHeader';
import PrintLabelsDialog from 'src/sections/barcodes/PrintLabelsDialog';
import * as barcodesApi from 'src/api/barcodes.api.js';

export default function PrintQueuePage() {
  const [printProduct, setPrintProduct] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);

  const { data, isLoading } = useQuery({
    queryKey: ['printQueue'],
    queryFn: () => barcodesApi.getPrintQueue().then((r) => r.data),
  });

  const rows = data || [];
  const paged = rows.slice(page * limit, page * limit + limit);

  return (
    <Box>
      <PageHeader title="Print Queue" subtitle="Barcodes waiting to be printed, grouped by product" />

      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Article</TableCell>
              <TableCell>Sizes</TableCell>
              <TableCell align="right">Pending</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r) => (
              <TableRow key={r.product} hover>
                <TableCell sx={{ fontWeight: 600 }}>{r.productName}</TableCell>
                <TableCell>{r.categoryName || '—'}</TableCell>
                <TableCell>{r.articleNumber}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {r.sizes.map((s) => (
                      <Chip key={s.size} size="small" label={`${s.size}×${s.count}`} />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Chip color="warning" label={r.pendingCount} />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PrintRoundedIcon />}
                    onClick={() => setPrintProduct(r)}
                  >
                    Print
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Print queue is empty 🎉
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </Paper>

      <PrintLabelsDialog product={printProduct} onClose={() => setPrintProduct(null)} />
    </Box>
  );
}
