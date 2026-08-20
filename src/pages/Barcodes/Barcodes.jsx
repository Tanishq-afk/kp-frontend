import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Chip, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, TextField, Tooltip,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PageHeader from 'src/components/PageHeader';
import ConfirmDialog from 'src/components/ConfirmDialog';
import BarcodeLabel from 'src/sections/barcodes/BarcodeLabel.jsx';
import * as barcodesApi from 'src/api/barcodes.api.js';
import { useDebounce } from 'src/hooks/useDebounce.js';
import { errorMessage, formatCurrency } from 'src/utils/format.js';
import { printBarcodeLabels } from 'src/utils/printBarcodeLabel.js';

const STATUS_COLOR = { available: 'default', sold: 'success', returned: 'warning', void: 'error' };

// Barcode ↔ product lookup: search any unit by (a fragment of) its printed
// number or by product name, print or delete exactly that one unit. Delete
// is blocked server-side for sold units (billing history) -- disabled here
// too so it's obvious before clicking.
export default function BarcodesPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [deleting, setDeleting] = useState(null);
  const [printing, setPrinting] = useState(null); // the barcode currently mid-print

  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading } = useQuery({
    queryKey: ['barcodes', { debounced, page, limit }],
    queryFn: () =>
      barcodesApi.listBarcodes({
        code: debounced || undefined,
        page: page + 1,
        limit,
      }),
    placeholderData: keepPreviousData,
  });

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;

  const del = useMutation({
    mutationFn: (id) => barcodesApi.deleteBarcode(id),
    onSuccess: () => {
      enqueueSnackbar('Barcode deleted', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['barcodes'] });
      setDeleting(null);
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  const handlePrint = async (barcode) => {
    setPrinting(barcode);
    try {
      await printBarcodeLabels([barcode], () => window.print());
    } catch (e) {
      enqueueSnackbar(`Print failed: ${e}`, { variant: 'error' });
    } finally {
      setPrinting(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Barcodes"
        subtitle="Look up any barcode by number or product — print or delete a single unit"
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by barcode number or product name…"
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
              <TableCell>Barcode</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Size</TableCell>
              <TableCell align="right">MRP</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Print status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((b) => (
              <TableRow key={b._id} hover>
                <TableCell sx={{ fontFamily: 'monospace' }}>{b.code}</TableCell>
                <TableCell>{b.productName}</TableCell>
                <TableCell>{b.size}</TableCell>
                <TableCell align="right">{formatCurrency(b.mrp)}</TableCell>
                <TableCell>
                  <Chip size="small" label={b.status} color={STATUS_COLOR[b.status] || 'default'} />
                </TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" label={b.printStatus} />
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Print this label">
                    <span>
                      <IconButton size="small" onClick={() => handlePrint(b)} disabled={printing?._id === b._id}>
                        <PrintRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={b.status === 'sold' ? "Sold — can't delete (billing history)" : 'Delete this barcode'}>
                    <span>
                      <IconButton size="small" onClick={() => setDeleting(b)} disabled={b.status === 'sold'}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {debounced ? 'No matching barcodes' : 'No barcodes found'}
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
          rowsPerPageOptions={[25, 50, 100]}
        />
      </Paper>

      {/* Off-screen in normal view; print.css's @media print rules pull
          .print-area into the actual print flow regardless of this
          positioning. Only needed for the browser-print fallback (no Tauri /
          no label printer configured) -- the Tauri raw-print path never
          touches this. */}
      {printing && (
        <Box sx={{ position: 'absolute', left: -9999, top: 0 }}>
          <Box className="print-area">
            <BarcodeLabel barcode={printing} />
          </Box>
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete barcode"
        message={`Delete barcode "${deleting?.code}" (${deleting?.productName}, ${deleting?.size})? This removes it from tracking entirely and cannot be undone.`}
        confirmText="Delete"
        loading={del.isPending}
        onConfirm={() => del.mutate(deleting._id)}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
}
