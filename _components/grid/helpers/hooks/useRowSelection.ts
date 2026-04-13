import { useCallback, useState } from "react";

/**
 * Manages per-row checkbox selection state for the grid.
 *
 * Instantiated once on `Grid` so `GridBody` and `GridFooter` share the same `Set` of
 * selected indices (footer rows can be selected like any other row).
 *
 * @returns `selectedRows` set, a `toggleRow` function, and an `isSelected` predicate.
 */
export function useRowSelection() {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const toggleRow = useCallback((rowIndex: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return next;
    });
  }, []);

  const isSelected = useCallback(
    (rowIndex: number) => selectedRows.has(rowIndex),
    [selectedRows],
  );

  return { selectedRows, toggleRow, isSelected } as const;
}
