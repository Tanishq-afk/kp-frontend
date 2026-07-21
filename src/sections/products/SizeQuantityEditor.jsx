import { Grid, TextField, Typography } from '@mui/material';
import { sizesForType } from 'src/config/constants.js';

// Renders the allowed sizes for the chosen size type with a quantity field each.
// `value` is a { [size]: quantityString } map.
export default function SizeQuantityEditor({ sizeType, value, onChange }) {
  const sizes = sizesForType(sizeType);
  if (!sizes.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Select a size type to enter quantities.
      </Typography>
    );
  }
  const set = (size, qty) => onChange({ ...value, [size]: qty });

  return (
    <Grid container spacing={1.5}>
      {sizes.map((s) => (
        <Grid item xs={6} sm={4} md={3} key={s}>
          <TextField
            fullWidth
            type="number"
            label={s}
            value={value[s] ?? ''}
            onChange={(e) => set(s, e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Grid>
      ))}
    </Grid>
  );
}
