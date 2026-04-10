"use client";

import { useCallback } from "react";
import { toast } from "react-toastify";
import styles from "../../grid.module.css";

/**
 * Props for {@link GridCellRenderer}, the default body cell for non-checkbox columns.
 */
export interface GridCellRendererProps {
  /** Resolved string shown in the cell (after formatters and null handling). */
  displayValue: string;

  /**
   * Combined CSS class names for the cell wrapper, including focus and column
   * overrides from the parent grid.
   */
  cellClass: string;

  /** Inline width constraints from the column definition; `undefined` when none apply. */
  cellStyle: React.CSSProperties | undefined;

  /** Zero-based row index within the current `rowData` slice. */
  rowIndex: number;

  /** Zero-based column index within `columnDefs` (including checkbox column if present). */
  colIndex: number;

  /** Called when the cell receives focus; parent typically records `{ rowIndex, colIndex }`. */
  onFocus: () => void;

  /** Called when the cell loses focus; parent typically clears the focused-cell state. */
  onBlur: () => void;
}

/**
 * GridCellRenderer
 *
 * Renders a single focusable data cell (`role="cell"`) with the formatted display value.
 * Used by {@link GridBody} for columns that are not checkbox selection columns.
 *
 * ### Clipboard
 * **Ctrl+C** / **Cmd+C** copies {@link GridCellRendererProps.displayValue} to the
 * clipboard and shows a short success toast (via `react-toastify`).
 *
 * ### Double-click
 * Placeholder handler logs row/column indices; inline editing is not implemented yet.
 *
 * @param props - {@link GridCellRendererProps}
 * @returns A cell `<div>` containing the display text span.
 */
export default function GridCellRenderer({
  displayValue,
  cellClass,
  cellStyle,
  rowIndex,
  colIndex,
  onFocus,
  onBlur,
}: GridCellRendererProps) {
  /**
   * Returns a `keydown` handler for a cell that copies the cell's display
   * value to the clipboard when the user presses Ctrl+C / Cmd+C.
   *
   * Implemented as a curried `useCallback` so the factory itself is stable
   * across renders; each call returns a lightweight closure bound to the
   * specific `value` string for that cell.
   *
   * @param value - The display string already rendered inside the cell.
   * @returns A `KeyboardEvent` handler for the cell `<div>`.
   */
  const handleCellKeyDown = useCallback(
    (value: string) => (event: React.KeyboardEvent<HTMLDivElement>) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        event.stopPropagation();
        void navigator.clipboard.writeText(value);
        toast.success("Cell value copied");
      }
    },
    [],
  );

  return (
    <div
      className={cellClass}
      style={cellStyle}
      role="cell"
      title={displayValue}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleCellKeyDown(displayValue)}
      onDoubleClick={() => {
        // TODO: render the edit field with the value in that field
        console.log("double click", rowIndex, colIndex);
      }}
    >
      <span className={styles.bodyCellText}>{displayValue}</span>
    </div>
  );
}
