import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack,
  TextField, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { useIsMobile } from 'src/hooks/useIsMobile.js';
import useBarcodeSelection from 'src/hooks/useBarcodeSelection.js';
import BarcodeLabel from './BarcodeLabel.jsx';
import BarcodeSearchList from './BarcodeSearchList.jsx';
import * as barcodesApi from 'src/api/barcodes.api.js';
import { errorMessage } from 'src/utils/format.js';
import { printBarcodeLabels } from 'src/utils/printBarcodeLabel.js';

// `product` is a print-queue row ({ product, productName, categoryName, ... }).
//
// Two ways to pick what to print, sharing one selection set: a per-size
// quantity ("print 2 of the 5 pending M labels now", doesn't matter which —
// units within a size are fungible) or a search-by-code box (a specific
// known unit). "Mark printed" only marks the units actually
// selected/printed, not every pending unit for the product.
export default function PrintLabelsDialog({ product, onClose }) {
  const open = Boolean(product);
  const isMobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const [printing, setPrinting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['printLabels', product?.product],
    queryFn: () =>
      barcodesApi
        .listBarcodes({ product: product.product, printStatus: 'pending', limit: 200 })
        .then((r) => r.data),
    enabled: open,
  });
  const labels = data || [];
  const {
    bySize, isSelected, toggle, setSizeQuantity, sizeQuantity, selected,
  } = useBarcodeSelection(labels);

  const mark = useMutation({
    mutationFn: () => barcodesApi.markPrinted({ ids: selected.map((b) => b._id) }),
    onSuccess: (res) => {
      enqueueSnackbar(`Marked ${res.data.modified} label(s) printed`, { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['printQueue'] });
      qc.invalidateQueries({ queryKey: ['printLabels', product?.product] });
      onClose();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printBarcodeLabels(selected, () => window.print());
    } catch (e) {
      enqueueSnackbar(`Print failed: ${e}`, { variant: 'error' });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={isMobile}>
      <DialogTitle
        className="no-print"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        Print labels — {product?.productName}
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <>
            {labels.length === 0 ? (
              <Typography color="text.secondary">No pending labels.</Typography>
            ) : (
              <Stack spacing={2} className="no-print" sx={{ mb: 2 }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    How many of each size to print
                  </Typography>
                  {Object.entries(bySize).map(([size, arr]) => (
                    <Stack key={size} direction="row" alignItems="center" spacing={2}>
                      <Typography sx={{ minWidth: 100, fontWeight: 500 }}>{size}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                        {arr.length} pending
                      </Typography>
                      <TextField
                        type="number"
                        size="small"
                        label="Print qty"
                        value={sizeQuantity(size)}
                        onChange={(e) => setSizeQuantity(size, e.target.value)}
                        inputProps={{ min: 0, max: arr.length }}
                        sx={{ width: 110 }}
                      />
                    </Stack>
                  ))}
                </Stack>
                <Divider />
                <BarcodeSearchList barcodes={labels} isSelected={isSelected} onToggle={toggle} />
              </Stack>
            )}
            <Box className="print-area" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {selected.map((b) => (
                <BarcodeLabel key={b._id} barcode={b} />
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions className="no-print" sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          startIcon={<PrintRoundedIcon />}
          onClick={handlePrint}
          disabled={!selected.length || printing}
        >
          {printing ? 'Printing…' : `Print${selected.length ? ` (${selected.length})` : ''}`}
        </Button>
        <Button
          variant="contained"
          onClick={() => mark.mutate()}
          disabled={!selected.length || mark.isPending}
        >
          {mark.isPending ? 'Working…' : `Mark printed${selected.length ? ` (${selected.length})` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
