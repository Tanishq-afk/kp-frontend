import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import JsBarcode from 'jsbarcode';
import { formatCurrency } from '../../../utils/format.js';

// A single printable label: product name, size, MRP, the scannable Code128
// barcode (with its code), category, and the serial number.
export default function BarcodeLabel({ barcode, categoryName }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, barcode.code, {
        format: 'CODE128',
        height: 38,
        width: 1.4,
        fontSize: 12,
        margin: 2,
        displayValue: true,
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
      }}
    >
      <Typography variant="caption" fontWeight={700} noWrap display="block">
        {barcode.productName}
      </Typography>
      <Typography variant="caption" display="block">
        Size {barcode.size} · {formatCurrency(barcode.mrp)}
      </Typography>
      <svg ref={svgRef} style={{ maxWidth: '100%' }} />
      <Typography variant="caption" color="text.secondary" display="block" noWrap>
        {categoryName ? `${categoryName} · ` : ''}#{barcode.serialNumber}
      </Typography>
    </Box>
  );
}
