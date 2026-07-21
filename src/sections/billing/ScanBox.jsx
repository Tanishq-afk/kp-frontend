import { useState } from 'react';
import { Button, InputAdornment, Paper, Stack, TextField } from '@mui/material';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';

// Barcode entry. A scanner types the code + Enter; manual entry uses the button.
export default function ScanBox({ onScan, loading }) {
  const [code, setCode] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const c = code.trim();
    if (!c) return;
    onScan(c);
    setCode('');
  };

  return (
    <Paper component="form" onSubmit={submit} sx={{ p: 2 }}>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Scan or enter barcode…"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QrCodeScannerRoundedIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button type="submit" variant="contained" disabled={loading || !code.trim()}>
          Add
        </Button>
      </Stack>
    </Paper>
  );
}
