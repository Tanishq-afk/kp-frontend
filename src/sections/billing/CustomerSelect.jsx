import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Autocomplete, Button, Chip, InputAdornment, Paper, Stack, TextField, Typography,
} from '@mui/material';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import * as customersApi from 'src/api/customers.api.js';
import { useDebounce } from 'src/hooks/useDebounce.js';

// Phone-first customer entry: look up by phone (autofills an existing customer),
// search by name (suggests matches so the right same-named customer can be
// picked by their phone number), or type a new name (created on bill completion).
export default function CustomerSelect({ customer, onChange, onLookup }) {
  const [looking, setLooking] = useState(false);
  const [status, setStatus] = useState(null); // 'found' | 'new' | null

  const debouncedName = useDebounce(customer.name);
  const nameSearchEnabled = !customer.id && debouncedName.trim().length >= 2;
  const { data: nameMatches, isFetching: searching } = useQuery({
    queryKey: ['customer-name-search', debouncedName],
    queryFn: () => customersApi.listCustomers({ search: debouncedName.trim(), isActive: true, limit: 8 }),
    enabled: nameSearchEnabled,
  });
  const suggestions = nameSearchEnabled ? nameMatches?.data || [] : [];

  const clearSelection = () => {
    // A selected match filled name+phone together — clearing the name
    // undoes that whole pick, not just the text. A hand-typed name only
    // clears itself.
    onChange(customer.id ? { id: null, name: '', phone: '' } : { ...customer, name: '', id: null });
    setStatus(null);
  };

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
        <Autocomplete
          freeSolo
          filterOptions={(x) => x}
          options={suggestions}
          loading={searching}
          inputValue={customer.name}
          onInputChange={(e, value, reason) => {
            if (reason === 'clear') {
              clearSelection();
            } else if (reason === 'input') {
              onChange({ ...customer, name: value, id: null });
              setStatus(null);
            }
          }}
          onChange={(e, value, reason) => {
            if (reason === 'clear') {
              clearSelection();
            } else if (value && typeof value === 'object') {
              onChange({ id: value._id, name: value.name, phone: value.phone });
              setStatus('found');
            }
          }}
          getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.name)}
          isOptionEqualToValue={(opt, val) => opt._id === val?._id}
          renderOption={(props, option) => (
            <li {...props} key={option._id}>
              <Stack>
                <Typography variant="body2">{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">{option.phone}</Typography>
              </Stack>
            </li>
          )}
          renderInput={(params) => <TextField {...params} fullWidth label="Name" />}
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
