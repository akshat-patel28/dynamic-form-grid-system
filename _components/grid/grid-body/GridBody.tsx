"use client";
import { getColumnCellStyle } from "../helpers/utils/columnSizingStyle";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import type { ColumnDef, FocusedCell } from "../helpers/types/types";
import styles from "../grid.module.css";
import GridCellRenderer from "./cell-renderer/GridCellRenderer";

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
   * Full row array; cells read `rowData[i]` using indices from `rowIndices`.
   */
  rowData: TData[];

  /**
   * Zero-based indices into `rowData` for rows rendered in document order.
   * Callbacks use the same indices as keys into `rowData`.
   */
  rowIndices: number[];

  /** Called when a cell value is committed after inline editing. */
  onCellValueChange: (rowIndex: number, field: string, value: unknown) => void;

  toggleRow: (rowIndex: number) => void;
  isSelected: (rowIndex: number) => boolean;
}

/**
 * GridBody
 *
 * Renders the scrollable data section of the grid. For each index in
 * `rowIndices` it produces one row `<div>` containing one cell per column.
 *
 * ### Cell value resolution
 * Non-checkbox cells use {@link resolveCellValue} in {@link GridCellRenderer}
 * (`valueFormatter` when set, otherwise `row[col.field]` with null-safe string coercion).
 *
 * ### Keyboard navigation
 * Every cell is focusable (`tabIndex={0}`). Pressing **Tab** advances focus to
 * the next cell across columns then rows (natural DOM order). **Shift + Tab**
 * moves backwards. This behaviour is provided by the browser's default focus
 * management — no custom key handling is required.
 *
 * ### Focus highlight
 * Focus state is lifted here; {@link GridCellRenderer} applies `bodyCellFocused` when
 * indices match so the active cell stays visible for keyboard navigation.
 *
 * ### Row selection
 * A column with `checkboxSelection: true` renders a checkbox per row. Selection
 * state is controlled by the parent via `toggleRow` / `isSelected`.
 *
 * ### Toasts
 * A {@link ToastContainer} is rendered once for the body so cell copy actions
 * (see {@link GridCellRenderer}) can show transient feedback.
 *
 * ### Empty state
 * When `rowData` is an empty array a centred "No Records Found" message is
 * rendered. When `rowData` has rows but `rowIndices` is empty, only the toast
 * host is rendered (e.g. sticky footer holds the only visible row).
 *
 * @param props - {@link GridBodyProps}
 * @returns The empty-state block, or a fragment of row `<div>` elements plus
 *   `ToastContainer`.
 *
 * @example
 * ```tsx
 * <GridBody
 *   columnDefs={[{ headerName: 'Name', field: 'name' }]}
 *   rowData={[{ name: 'Alice' }, { name: 'Bob' }]}
 *   rowIndices={[0, 1]}
 *   toggleRow={(i) => {}}
 *   isSelected={() => false}
 *   onCellValueChange={(rowIndex, field, value) => {
 *     // persist or lift state
 *   }}
 * />
 * ```
 */
const GridBody = <TData extends Record<string, unknown>>({
  columnDefs,
  rowData,
  rowIndices,
  onCellValueChange,
  toggleRow,
  isSelected,
}: GridBodyProps<TData>) => {
  /**
   * Tracks which cell currently has keyboard / pointer focus.
   * `null` when no cell is focused (e.g. focus is outside the grid).
   */
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);
  const hasCheckboxColumn = columnDefs.some((col) => col.checkboxSelection);

  if (rowData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.noData}>No Records Found</p>
      </div>
    );
  }

  const toastHost = (
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
  );

  if (rowIndices.length === 0) {
    return <>{toastHost}</>;
  }

  return (
    <>
      {rowIndices.map((rowIndex) => {
        const row = rowData[rowIndex];
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

              return (
                <GridCellRenderer
                  key={col.field}
                  columnDef={col}
                  row={row}
                  focusedCell={focusedCell}
                  cellStyle={getColumnCellStyle(col)}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  onFocus={() => setFocusedCell({ rowIndex, colIndex })}
                  onBlur={() => setFocusedCell(null)}
                  onCellValueChange={onCellValueChange}
                />
              );
            })}
          </div>
        );
      })}
      {toastHost}
    </>
  );
};

export default GridBody;
