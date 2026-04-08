"use client";
import { useCallback, useState } from "react";
import type { ColumnDef } from "./types";
import styles from "./grid.module.css";

/**
 * Identifies a single focused cell by its row and column index.
 */
interface FocusedCell {
  rowIndex: number;
  colIndex: number;
}

/**
 * Props for the `GridBody` component.
 *
 * @template TData Shape of a single row object. Defaults to
 *   `Record<string, unknown>` when not specified.
 */
interface GridBodyProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Column definitions used to determine which fields to read from each row
   * and any optional cell-level styling.
   */
  columnDefs: ColumnDef<TData>[];

  /**
   * Array of row data objects to render.
   * When the array is empty the component renders the empty state message
   * instead of a list of rows.
   */
  rowData: TData[];
}

/**
 * GridBody
 *
 * Renders the scrollable data section of the grid. For each entry in
 * `rowData` it produces one row `<div>` containing one cell per column.
 *
 * ### Cell value resolution
 * The value displayed in each cell is read directly from `row[col.field]`.
 * `null` / `undefined` fields render as an empty string so cell layout is
 * preserved.
 *
 * ### Keyboard navigation
 * Every cell is focusable (`tabIndex={0}`). Pressing **Tab** advances focus to
 * the next cell across columns then rows (natural DOM order). **Shift + Tab**
 * moves backwards. This behaviour is provided by the browser's default focus
 * management — no custom key handling is required.
 *
 * ### Focus highlight
 * The currently focused cell receives the `bodyCellFocused` CSS class, which
 * applies a visible outline and background tint so the active cell is always
 * identifiable, including when the grid is navigated by keyboard alone.
 *
 * ### Empty state
 * When `rowData` is an empty array a centred "No Records Found" message is
 * rendered spanning the full width of the container.
 *
 * @param props - {@link GridBodyProps}
 * @returns A fragment of row `<div>` elements, or the empty-state message.
 *
 * @example
 * <GridBody
 *   columnDefs={[{ headerName: 'Name', field: 'name' }]}
 *   rowData={[{ name: 'Alice' }, { name: 'Bob' }]}
 * />
 */
const GridBody = <TData extends Record<string, unknown>>({
  columnDefs,
  rowData,
}: GridBodyProps<TData>) => {
  /**
   * Tracks which cell currently has keyboard / pointer focus.
   * `null` when no cell is focused (e.g. focus is outside the grid).
   */
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);

  /**
   * Resolves the display string for a cell.
   *
   * Resolution order:
   * 1. `col.valueFormatter({ rowData })` — when a formatter is defined on the column.
   * 2. `''`                              — when the raw value is `null` or `undefined`.
   * 3. `String(rawValue)`               — fallback coercion for all other values.
   *
   * @param col - The column definition for the cell being rendered.
   * @param row - The full row data object the cell belongs to.
   * @returns The string to display inside the cell.
   */
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
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        event.stopPropagation();
        navigator.clipboard.writeText(value);
        alert('Copied to clipboard');
      }
    },
    [],
  );

  const resolveCellValue = useCallback(
    (col: ColumnDef<TData>, row: TData): string => {
      if (col.valueFormatter) return col.valueFormatter({ rowData: row });
      const raw = row[col.field];
      return raw === null || raw === undefined ? "" : String(raw);
    },
    [],
  );

  if (rowData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.noData}>No Records Found</p>
      </div>
    );
  }

  return (
    <>
      {rowData.map((row, rowIndex) => (
        <div
          key={(row.id as string | number | undefined) ?? rowIndex}
          className={styles.bodyRow}
          role="row"
        >
          {columnDefs.map((col, colIndex) => {
            const displayValue = resolveCellValue(col, row);

            const isFocused =
              focusedCell?.rowIndex === rowIndex &&
              focusedCell?.colIndex === colIndex;

            const cellClass = [
              styles.bodyCell,
              isFocused ? styles.bodyCellFocused : "",
              col.cellClass ?? "",
              col.bodyCellClassName ?? "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={col.field}
                className={cellClass}
                style={
                  col.maxWidth
                    ? { maxWidth: col.maxWidth, minWidth: col.maxWidth }
                    : undefined
                }
                role="cell"
                title={displayValue}
                tabIndex={0}
                onFocus={() => setFocusedCell({ rowIndex, colIndex })}
                onBlur={() => setFocusedCell(null)}
                onKeyDown={handleCellKeyDown(displayValue)}
              >
                {displayValue}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};

export default GridBody;
