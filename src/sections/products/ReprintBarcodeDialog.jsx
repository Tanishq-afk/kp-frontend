import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack,
  TextField, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { useIsMobile } from 'src/hooks/useIsMobile.js';
import useBarcodeSelection from 'src/hooks/useBarcodeSelection.js';
import BarcodeLabel from 'src/sections/barcodes/BarcodeLabel.jsx';
import BarcodeSearchList from 'src/sections/barcodes/BarcodeSearchList.jsx';
import * as barcodesApi from 'src/api/barcodes.api.js';
import { printBarcodeLabels } from 'src/utils/printBarcodeLabel.js';

// Reprint a lost/damaged physical label. Unlike PrintLabelsDialog (the print
// queue, which only shows never-printed labels), this pulls every unit that's
// still `available` for the product regardless of printStatus — the whole
// point is re-printing a label that was already printed once and then lost.
//
// Two ways to pick what to print, sharing one selection set: a per-size
// quantity ("print 2 more of size M", doesn't matter which — units within a
// size are fungible) or a search-by-code box ("this exact one got lost",
// when you know/can look up its number).
export default function ReprintBarcodeDialog({ product, onClose }) {
  const open = Boolean(product);
  const isMobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const [printing, setPrinting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['reprintBarcodes', product?._id],
    queryFn: () =>
      barcodesApi
        .listBarcodes({ product: product._id, status: 'available', limit: 200 })
        .then((r) => r.data),
    enabled: open,
  });
  const labels = data || [];
  const {
    bySize, isSelected, toggle, setSizeQuantity, sizeQuantity, selected,
  } = useBarcodeSelection(labels);

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
        Reprint barcode — {product?.name}
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
              <Typography color="text.secondary">
                No in-stock units found for this product — nothing to print.
              </Typography>
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
                        {arr.length} available
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
          variant="contained"
          startIcon={<PrintRoundedIcon />}
          onClick={handlePrint}
          disabled={!selected.length || printing}
        >
          {printing ? 'Printing…' : `Print${selected.length ? ` (${selected.length})` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
