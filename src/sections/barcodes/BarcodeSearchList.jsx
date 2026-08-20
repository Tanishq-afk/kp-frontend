import { useState } from 'react';
import {
  Checkbox, FormControlLabel, InputAdornment, List, ListItem, Stack, TextField, Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

// Find-and-toggle one specific barcode by its printed code (or a fragment of
// it) instead of an "any N of this size" quantity -- for reprinting one
// exact lost/damaged label when you know (or can look up) its number.
// Toggling here shares the same selection set as the per-size quantity
// pickers (useBarcodeSelection), so the two stay in sync either way.
export default function BarcodeSearchList({ barcodes, isSelected, onToggle }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const matches = query ? barcodes.filter((b) => String(b.code).toLowerCase().includes(query)) : [];

  return (
    <Stack spacing={1} className="no-print">
      <TextField
        size="small"
        placeholder="Find a specific barcode number…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      {query && (matches.length > 0 ? (
        <List dense disablePadding sx={{ maxHeight: 220, overflowY: 'auto' }}>
          {matches.map((b) => (
            <ListItem key={b._id} disableGutters>
              <FormControlLabel
                control={(
                  <Checkbox size="small" checked={isSelected(b._id)} onChange={() => onToggle(b._id)} />
                )}
                label={`${b.code} — ${b.size}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">No match for &quot;{q}&quot;.</Typography>
      ))}
    </Stack>
  );
}
