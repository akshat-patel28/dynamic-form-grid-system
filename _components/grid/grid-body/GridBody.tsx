"use client";
import { getColumnCellStyle } from "../helpers/utils/columnSizingStyle";
import { useCallback, useState } from "react";
import { ToastContainer } from "react-toastify";
import type { ColumnDef } from "../helpers/types/types";
import { useRowSelection } from "../helpers/hooks/useRowSelection";
import styles from "../grid.module.css";
import GridCellRenderer from "./cell-renderer/GridCellRenderer";

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
  const { toggleRow, isSelected } = useRowSelection();
  const hasCheckboxColumn = columnDefs.some((col) => col.checkboxSelection);

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
      {rowData.map((row, rowIndex) => {
        const rowSelected = hasCheckboxColumn && isSelected(rowIndex);

        const rowClass = [
          styles.bodyRow,
          rowSelected ? styles.bodyRowSelected : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={(row.id as string | number | undefined) ?? rowIndex}
            className={rowClass}
            role="row"
          >
            {columnDefs.map((col, colIndex) => {
              if (col.checkboxSelection) {
                return (
                  <div
                    key={col.field}
                    className={`${styles.bodyCell} ${styles.checkboxCell}`}
                    role="cell"
                  >
                    <input
                      type="checkbox"
                      checked={rowSelected}
                      onChange={() => toggleRow(rowIndex)}
                    />
                  </div>
                );
              }

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
                <GridCellRenderer
                  key={col.field}
                  displayValue={displayValue}
                  cellClass={cellClass}
                  cellStyle={getColumnCellStyle(col)}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  onFocus={() => setFocusedCell({ rowIndex, colIndex })}
                  onBlur={() => setFocusedCell(null)}
                />
              );
            })}
          </div>
        );
      })}
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default GridBody;
