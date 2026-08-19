import { useEffect, useMemo, useState } from 'react';

// Groups a flat list of barcodes by size and tracks "how many to print" per
// size group, defaulting to each group's full count (untouched, this
// reproduces the old "print everything" behavior) — the caller can dial any
// size down to print fewer, including Free Size, which is just another
// group here. Units within a size are fungible (same product/size, distinct
// serials only) so "which N" doesn't matter, just how many.
export default function useSizeQuantitySelection(barcodes) {
  const bySize = useMemo(() => {
    const map = {};
    (barcodes || []).forEach((b) => {
      (map[b.size] ||= []).push(b);
    });
    return map;
  }, [barcodes]);

  const [qty, setQty] = useState({});

  useEffect(() => {
    setQty(Object.fromEntries(Object.keys(bySize).map((s) => [s, String(bySize[s].length)])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcodes]);

  const setQtyFor = (size, value) => setQty((q) => ({ ...q, [size]: value }));

  const selected = useMemo(
    () =>
      Object.entries(bySize).flatMap(([size, arr]) => {
        const n = Math.max(0, Math.min(arr.length, Number(qty[size]) || 0));
        return arr.slice(0, n);
      }),
    [bySize, qty]
  );

  return { bySize, qty, setQtyFor, selected };
}
