'use client';

import { useState } from 'react';
import type { ColumnDef } from './types';
import styles from './grid.module.css';

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
  columnDefs: ColumnDef[];

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
            const rawValue = row[col.field];
            const displayValue =
              rawValue === null || rawValue === undefined
                ? ''
                : String(rawValue);

            const isFocused =
              focusedCell?.rowIndex === rowIndex &&
              focusedCell?.colIndex === colIndex;

            const cellClass = [
              styles.bodyCell,
              isFocused ? styles.bodyCellFocused : '',
              col.cellClass ?? '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={col.field}
                className={cellClass}
                style={{ maxWidth: col.maxWidth }}
                role="cell"
                title={displayValue}
                tabIndex={0}
                onFocus={() => setFocusedCell({ rowIndex, colIndex })}
                onBlur={() => setFocusedCell(null)}
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
