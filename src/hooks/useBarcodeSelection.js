import { useEffect, useMemo, useState } from 'react';

// Tracks which specific barcodes (by _id) are selected for printing, out of
// a flat list scoped to one product. Two ways to adjust the same underlying
// selection set, meant to be used together:
//   - setSizeQuantity: bulk-select/deselect the first N of a size group --
//     fast, for "just print N of this size", doesn't care which specific
//     units (they're fungible: same product/size, distinct serials only).
//   - toggle: precise, single-unit selection -- paired with a
//     search-by-code box in the UI so one exact lost/damaged label can be
//     found and printed on its own instead of "any N".
// Defaults to everything selected (matches the old "print everything"
// behavior when nothing is touched).
export default function useBarcodeSelection(barcodes) {
  const list = barcodes || [];

  const bySize = useMemo(() => {
    const map = {};
    list.forEach((b) => {
      (map[b.size] ||= []).push(b);
    });
    return map;
  }, [list]);

  const [selectedIds, setSelectedIds] = useState(() => new Set(list.map((b) => b._id)));

  useEffect(() => {
    setSelectedIds(new Set(list.map((b) => b._id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcodes]);

  const isSelected = (id) => selectedIds.has(id);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Selects exactly the first `n` units of `size` (arbitrary which ones --
  // they're fungible), deselecting the rest of that group. Doesn't touch
  // other size groups' selections.
  const setSizeQuantity = (size, n) => {
    const arr = bySize[size] || [];
    const count = Math.max(0, Math.min(arr.length, Number(n) || 0));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      arr.forEach((b, i) => {
        if (i < count) next.add(b._id);
        else next.delete(b._id);
      });
      return next;
    });
  };

  const sizeQuantity = (size) => (bySize[size] || []).filter((b) => selectedIds.has(b._id)).length;

  const selected = useMemo(() => list.filter((b) => selectedIds.has(b._id)), [list, selectedIds]);

  return {
    bySize, isSelected, toggle, setSizeQuantity, sizeQuantity, selected,
  };
}
