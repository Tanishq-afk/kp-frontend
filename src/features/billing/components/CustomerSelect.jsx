import { useState } from 'react';
import { Button, Chip, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';

// Phone-first customer entry: look up by phone (autofills an existing customer),
// or type a name for a new one (created on bill completion).
export default function CustomerSelect({ customer, onChange, onLookup }) {
  const [looking, setLooking] = useState(false);
  const [status, setStatus] = useState(null); // 'found' | 'new' | null

  const doLookup = async () => {
    const phone = customer.phone.trim();
    if (!phone) return;
    setLooking(true);
    try {
      const found = await onLookup(phone);
      if (found) {
        onChange({ id: found._id, name: found.name, phone: found.phone });
        setStatus('found');
      } else {
        onChange({ ...customer, id: null });
        setStatus('new');
      }
    } finally {
      setLooking(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Customer <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography>
      </Typography>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            label="Phone"
            value={customer.phone}
            onChange={(e) => {
              onChange({ ...customer, phone: e.target.value });
              setStatus(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                doLookup();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalPhoneRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" onClick={doLookup} disabled={looking || !customer.phone.trim()}>
            Find
          </Button>
        </Stack>
        <TextField
          fullWidth
          label="Name"
          value={customer.name}
          onChange={(e) => onChange({ ...customer, name: e.target.value })}
        />
        {status === 'found' && (
          <Chip color="success" size="small" label="Existing customer" sx={{ alignSelf: 'flex-start' }} />
        )}
        {status === 'new' && (
          <Chip color="info" size="small" label="New customer — will be saved" sx={{ alignSelf: 'flex-start' }} />
        )}
      </Stack>
    </Paper>
  );
}
