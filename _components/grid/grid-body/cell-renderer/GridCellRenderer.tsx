"use client";

import { useCallback } from "react";
import { toast } from "react-toastify";
import type { ColumnDef, GridCellRendererProps } from "../../helpers/types/types";
import styles from "../../grid.module.css";

/**
 * Resolves the display string for a cell.
 *
 * Resolution order:
 * 1. `col.valueFormatter({ rowData })` — when a formatter is defined on the column.
 * 2. `''` — when the raw value is `null` or `undefined`.
 * 3. `String(rawValue)` — fallback coercion for all other values.
 *
 * @param col - The column definition for the cell being rendered.
 * @param row - The full row data object the cell belongs to.
 * @returns The string to display inside the cell.
 */
function resolveCellValue<TData extends Record<string, unknown>>(
  col: ColumnDef<TData>,
  row: TData,
): string {
  if (col.valueFormatter) return col.valueFormatter({ rowData: row });
  const raw = row[col.field];
  return raw === null || raw === undefined ? "" : String(raw);
}

/**
 * GridCellRenderer
 *
 * Renders a single focusable data cell (`role="cell"`) with the formatted display value.
 * Display text comes from {@link resolveCellValue}. Used by {@link GridBody} for columns
 * that are not checkbox selection columns.
 *
 * ### Clipboard
 * **Ctrl+C** / **Cmd+C** copies the resolved display string to the clipboard and shows
 * a short success toast (via `react-toastify`).
 *
 * ### Focus highlight
 * When `focusedCell` matches this cell’s indices, the wrapper
 * gets `bodyCellFocused` plus base and column-specific classes.
 *
 * ### Double-click
 * Placeholder handler logs row/column indices; inline editing is not implemented yet.
 *
 * @param props - {@link GridCellRendererProps}
 * @returns A cell `<div>` containing the display text span.
 */
export default function GridCellRenderer<
  TData extends Record<string, unknown>,
>({
  columnDef,
  row,
  focusedCell,
  cellStyle,
  rowIndex,
  colIndex,
  onFocus,
  onBlur,
}: GridCellRendererProps<TData>) {
  const displayValue = resolveCellValue(columnDef, row);

  const isFocused =
    focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex;

  const cellClass = [
    styles.bodyCell,
    isFocused ? styles.bodyCellFocused : "",
    columnDef.cellClass ?? "",
    columnDef.bodyCellClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

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
