import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import JsBarcode from 'jsbarcode';
import { formatNumber } from 'src/utils/format.js';

// A single printable label, matching the shop's physical label design:
// KIDZ PLAZA (shop name) / item name / scannable barcode / MRP.
// The barcode encodes barcode.code as-is (no asterisks — that would break the
// scan), but displays it wrapped in asterisks underneath purely as text, to
// match the shop's existing printed labels.
export default function BarcodeLabel({ barcode }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, barcode.code, {
        format: 'CODE128',
        height: 40,
        width: 1.5,
        fontSize: 13,
        margin: 4,
        displayValue: true,
        text: `*${barcode.code}*`,
      });
    }
  }, [barcode.code]);

  return (
    <Box
      className="label"
      sx={{
        width: 220,
        border: '1px solid #ddd',
        borderRadius: 1,
        p: 1,
        textAlign: 'center',
        bgcolor: '#fff',
        color: '#000',
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>
        KIDZ PLAZA
      </Typography>
      <Typography sx={{ fontSize: 11 }} noWrap>
        {barcode.productName}
      </Typography>
      <svg ref={svgRef} style={{ maxWidth: '100%' }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
        MRP :{formatNumber(barcode.mrp)}
      </Typography>
    </Box>
  );
}
