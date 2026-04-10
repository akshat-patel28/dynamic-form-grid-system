"use client";
import { getColumnCellStyle } from "../helpers/utils/columnSizingStyle";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import type { ColumnDef, FocusedCell } from "../helpers/types/types";
import { useRowSelection } from "../helpers/hooks/useRowSelection";
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
   * Array of row data objects to render.
   * When the array is empty the component renders the empty state message
   * instead of a list of rows.
   */
  rowData: TData[];

  /** Called when a cell value is committed after inline editing. */
  onCellValueChange: (rowIndex: number, field: string, value: unknown) => void;
}

/**
 * GridBody
 *
 * Renders the scrollable data section of the grid. For each entry in
 * `rowData` it produces one row `<div>` containing one cell per column.
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
 * A column with `checkboxSelection: true` renders a checkbox per row. Toggling it
 * selects the row (`useRowSelection`) and applies `bodyRowSelected` for highlight.
 *
 * ### Toasts
 * A {@link ToastContainer} is rendered once for the body so cell copy actions
 * (see {@link GridCellRenderer}) can show transient feedback.
 *
 * ### Empty state
 * When `rowData` is an empty array a centred "No Records Found" message is
 * rendered spanning the full width of the container.
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
 *   onCellValueChange={(rowIndex, field, value) => {
 *     // persist or lift state
 *   }}
 * />
 * ```
 */
const GridBody = <TData extends Record<string, unknown>>({
  columnDefs,
  rowData,
  onCellValueChange,
}: GridBodyProps<TData>) => {
  /**
   * Tracks which cell currently has keyboard / pointer focus.
   * `null` when no cell is focused (e.g. focus is outside the grid).
   */
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);
  const { toggleRow, isSelected } = useRowSelection();
  const hasCheckboxColumn = columnDefs.some((col) => col.checkboxSelection);

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
