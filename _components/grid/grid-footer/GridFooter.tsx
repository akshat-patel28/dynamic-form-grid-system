"use client";

/**
 * @fileoverview Sticky footer row for the data grid.
 *
 * The parent `Grid` component passes the row at `stickyFooterRowIndex` here so
 * it stays pinned to the bottom of the scroll area. Consumers normally use
 * `<Grid />` only; this module is for internal layout composition.
 */

import { useState } from "react";
import { getColumnCellStyle } from "../helpers/utils/columnSizingStyle";
import type { ColumnDef, FocusedCell } from "../helpers/types/types";
import styles from "../grid.module.css";
import GridCellRenderer from "../grid-body/cell-renderer/GridCellRenderer";

/**
 * Props for the `GridFooter` component.
 *
 * @template TData Shape of a single row object. Defaults to
 *   `Record<string, unknown>` when not specified.
 */
interface GridFooterProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Same column schema as the grid header and body. Each definition maps to one
   * footer cell left-to-right so column widths and formatters stay aligned.
   */
  columnDefs: ColumnDef<TData>[];

  /**
   * Full row array from the parent grid. The footer reads
   * `rowData[footerRowIndex]` only; it does not iterate the whole list.
   */
  rowData: TData[];

  /**
   * Zero-based index of the row in `rowData` to render as the sticky footer.
   * Must match the index the parent uses for `stickyFooterRowIndex` so
   * `onCellValueChange` and selection callbacks receive a stable row identity.
   */
  footerRowIndex: number;

  /**
   * Commits inline edits from `GridCellRenderer`. Invoked with `rowIndex === footerRowIndex`
   * for footer cells; parent `Grid` forwards the same handler as for body rows.
   */
  onCellValueChange: (rowIndex: number, field: string, value: unknown) => void;

  /**
   * Toggles checkbox selection for `footerRowIndex`. Supplied by the parent so
   * the footer shares selection state with `GridBody`.
   */
  toggleRow: (rowIndex: number) => void;

  /**
   * Returns whether `footerRowIndex` is selected when a checkbox column exists.
   */
  isSelected: (rowIndex: number) => boolean;
}

/**
 * GridFooter
 *
 * Renders **one** data row pinned to the **bottom** of the grid’s scroll
 * container. The outer wrapper (`.footerStack` in `grid.module.css`) uses
 * `position: sticky` and `bottom: 0` so the row stays visible while the user
 * scrolls the body vertically. Because header, body, and footer live in the
 * same `overflow: auto` element, **horizontal scroll is shared** — footer
 * cells stay aligned with header and body columns without `scrollLeft` sync.
 *
 * ### Layout and styling
 * - Checkbox columns render like the body: an empty-aligned checkbox wired to
 *   `toggleRow(footerRowIndex)` and `isSelected(footerRowIndex)`.
 * - Data columns use `GridCellRenderer` with `getColumnCellStyle` so
 *   `width` / `minWidth` / `maxWidth` match the rest of the grid.
 * - Footer cells reuse `.bodyCell` for typography and layout; `.footerRow` and
 *   the stack wrapper apply footer-specific background and borders.
 *
 * ### Focus and editing
 * Focus state is **local** to this component (`useState<FocusedCell | null>`).
 * Keyboard focus in the footer does not interact with body focus highlights,
 * which avoids index collisions because `rowIndex` in the footer is always
 * `footerRowIndex`. Inline editing, copy-to-clipboard, and value formatters
 * behave the same as in the body.
 *
 * ### Empty / missing row
 * If `rowData[footerRowIndex]` is `undefined` (e.g. index out of sync after a
 * data change), the component returns `null` and renders nothing.
 *
 * @template TData Row record type aligned with parent `Grid` generics.
 * @param props - {@link GridFooterProps}
 * @returns A sticky footer stack containing a single `role="row"` div, or
 *   `null` when the footer row is missing.
 *
 * @example
 * ```tsx
 * // Typically composed by <Grid stickyFooterRowIndex={…} /> only.
 * <GridFooter
 *   columnDefs={columns}
 *   rowData={rows}
 *   footerRowIndex={rows.length - 1}
 *   onCellValueChange={(rowIndex, field, value) => {}}
 *   toggleRow={(i) => {}}
 *   isSelected={(i) => false}
 * />
 * ```
 */
const GridFooter = <TData extends Record<string, unknown>>({
  columnDefs,
  rowData,
  footerRowIndex,
  onCellValueChange,
  toggleRow,
  isSelected,
}: GridFooterProps<TData>) => {
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);
  const hasCheckboxColumn = columnDefs.some((col) => col.checkboxSelection);
  const row = rowData[footerRowIndex];
  if (!row) return null;

  const rowSelected = hasCheckboxColumn && isSelected(footerRowIndex);
  const rowClass = [
    styles.footerRow,
    rowSelected ? styles.bodyRowSelected : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.footerStack}>
      <div
        key={(row.id as string | number | undefined) ?? footerRowIndex}
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
                  onChange={() => toggleRow(footerRowIndex)}
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
              rowIndex={footerRowIndex}
              colIndex={colIndex}
              onFocus={() =>
                setFocusedCell({ rowIndex: footerRowIndex, colIndex })
              }
              onBlur={() => setFocusedCell(null)}
              onCellValueChange={onCellValueChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GridFooter;
