"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { GridProps, GridSelection } from "./helpers/types/types";
import { useRowSelection } from "./helpers/hooks/useRowSelection";
import GridHeader from "./grid-header/GridHeader";
import GridBody from "./grid-body/GridBody";
import GridFooter from "./grid-footer/GridFooter";
import styles from "./grid.module.css";

/**
 * Fixed pixel heights for the header, footer, and body rows.
 *
 * These mirror the `height` declarations in `grid.module.css` and are used to
 * size the virtualized body list. If you change any of these values, update
 * the matching CSS rules (`.headerCell`, `.bodyCell`, `.footerRow .bodyCell`)
 * so the DOM measurements and react-window's item size stay in sync.
 */
const HEADER_H = 47;
const FOOTER_H = 42;
const BODY_ROW_H = 42;

/**
 * Returns a shallow-copied row array with one field updated at `rowIndex`.
 * Used by `Grid` so `setInternalRowData` callbacks stay shallow for Sonar nesting limits.
 */
function replaceRowField<TData extends Record<string, unknown>>(
  rows: TData[],
  rowIndex: number,
  field: string,
  value: unknown,
): TData[] {
  return rows.map((row, i) =>
    i === rowIndex ? { ...row, [field]: value } : row,
  );
}

/**
 * Grid
 *
 * A generic, horizontally-scrollable data grid component.
 *
 * ## Layout
 * ```
 * ┌─────────────────────────────────────────── gridContainer (overflow: auto) ──┐
 * │  ┌── GridHeader (position: sticky, top: 0) ───────────────────────────────┐ │
 * │  │  col 1  │  col 2  │  col 3  │  …  │  col N                            │ │
 * │  └─────────────────────────────────────────────────────────────────────────┘ │
 * │  ┌── GridBody ─────────────────────────────────────────────────────────────┐ │
 * │  │  row 1, cell 1  │  row 1, cell 2  │  …                                 │ │
 * │  │  row 2, cell 1  │  row 2, cell 2  │  …                                 │ │
 * │  └─────────────────────────────────────────────────────────────────────────┘ │
 * │  Optional: GridFooter (sticky bottom) when `stickyFooterRowIndex` is set       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Horizontal scrolling
 * Each cell has `min-width: 200px` and `flex: 1`. When the combined minimum
 * width of all columns exceeds the container width (e.g. 20+ columns), the
 * container scrolls horizontally. No extra configuration is required.
 *
 * ## Row state & inline edits
 * On mount, `rowData` is shallow-cloned into internal state so committing an edit
 * from a cell updates the grid without mutating the prop array. Consumers still
 * pass `rowData` as the initial snapshot; the grid does not sync props back into
 * that state after mount.
 *
 * ## Sticky footer
 * Optional `stickyFooterRowIndex` pins one row to the bottom (`GridFooter`) when the
 * value is an integer in range. That row is omitted from `GridBody`; it still uses
 * the same `rowIndex` in `onCellValueChanged` as if it were in the body.
 *
 * ## Checkbox selection
 * `useRowSelection` runs here so `GridBody` and `GridFooter` share one selection set
 * for the checkbox column.
 *
 * ## Selection API
 * Two complementary ways to consume checkbox selection:
 *
 * 1. **Imperative** — create `const gridRef = useRef<GridApi<TData>>(null)`
 *    on the consumer, pass it as the `gridRef` prop, and call
 *    `gridRef.current?.getSelectedRows()` / `gridRef.current?.clearSelection()`
 *    from external UI (toolbar Delete, export, etc.). Same pattern as AG
 *    Grid — the ref is a plain prop, not a React `forwardRef`.
 * 2. **Reactive** — pass `onSelectionChanged` to receive the same
 *    `{ rows, indices }` snapshot whenever selection changes; useful for
 *    enabling a toolbar button or rendering a selected-count badge.
 *
 * Both return `GridSelection<TData>` with ascending `indices` that refer to
 * the grid's current internal `rowData` (same index space as
 * `onCellValueChanged`).
 *
 * @example
 * const gridRef = useRef<GridApi<Employee>>(null);
 * const [count, setCount] = useState(0);
 *
 * <Grid<Employee>
 *   gridRef={gridRef}
 *   columnDefs={cols}
 *   rowData={rows}
 *   onSelectionChanged={(sel) => setCount(sel.indices.length)}
 * />
 *
 * ## Usage
 * ```tsx
 * import { Grid } from '@/_components/grid';
 * import type { ColumnDef } from '@/_components/grid';
 *
 * const columns: ColumnDef[] = [
 *   { headerName: 'ID',   field: 'id',   maxWidth: '80px' },
 *   { headerName: 'Name', field: 'name' },
 * ];
 *
 * const rows = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 * ];
 *
 * export default function Page() {
 *   return (
 *     <Grid
 *       columnDefs={columns}
 *       rowData={rows}
 *       stickyFooterRowIndex={rows.length - 1}
 *     />
 *   );
 * }
 * ```
 *
 * @template TData Shape of a single row data object.
 *   Defaults to `Record<string, unknown>` when not specified.
 *
 * @param props - {@link GridProps}
 * @returns Header, body, optional sticky footer, and `ToastContainer` (via body), all
 *   inside one scrollable `div` (`role="table"`).
 */
const Grid = <TData extends Record<string, unknown> = Record<string, unknown>>({
  columnDefs,
  rowData,
  onCellValueChanged,
  onSelectionChanged,
  stickyFooterRowIndex,
  className,
  gridRef,
}: GridProps<TData>) => {
  const [internalRowData, setInternalRowData] = useState<TData[]>(() =>
    rowData.map((row) => ({ ...row })),
  );

  const { selectedRows, toggleRow, isSelected, clearSelection } =
    useRowSelection();

  const resolvedFooterIndex =
    stickyFooterRowIndex !== undefined &&
    Number.isInteger(stickyFooterRowIndex) &&
    stickyFooterRowIndex >= 0 &&
    stickyFooterRowIndex < internalRowData.length
      ? stickyFooterRowIndex
      : undefined;

  const bodyRowIndices = useMemo(() => {
    const n = internalRowData.length;
    if (resolvedFooterIndex === undefined) {
      return Array.from({ length: n }, (_, i) => i);
    }
    return Array.from({ length: n }, (_, i) => i).filter(
      (i) => i !== resolvedFooterIndex,
    );
  }, [internalRowData.length, resolvedFooterIndex]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState(0);

  const hasStickyFooter = resolvedFooterIndex !== undefined;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const footerContribution = hasStickyFooter ? FOOTER_H : 0;

    const updateHeight = () => {
      const next = Math.max(
        0,
        container.clientHeight - HEADER_H - footerContribution,
      );
      setBodyHeight((prev) => (prev === next ? prev : next));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [hasStickyFooter]);

  const rowDataRef = useRef(internalRowData);
  const onCellValueChangedRef = useRef(onCellValueChanged);
  const onSelectionChangedRef = useRef(onSelectionChanged);

  useEffect(() => {
    rowDataRef.current = internalRowData;
  }, [internalRowData]);

  useEffect(() => {
    onCellValueChangedRef.current = onCellValueChanged;
  }, []);

  useEffect(() => {
    onSelectionChangedRef.current = onSelectionChanged;
  }, []);

  const updateCellValue = useCallback(
    (rowIndex: number, field: string, value: unknown) => {
      const currentRow = rowDataRef.current[rowIndex];
      const oldValue = currentRow?.[field];

      setInternalRowData((prev) =>
        replaceRowField(prev, rowIndex, field, value),
      );

      if (onCellValueChangedRef.current && currentRow) {
        const revert = () => {
          setInternalRowData((prev) =>
            replaceRowField(prev, rowIndex, field, oldValue),
          );
        };
        onCellValueChangedRef.current({
          rowIndex,
          field,
          oldValue,
          newValue: value,
          rowData: currentRow,
          revert,
        });
      }
    },
    [],
  );

  const buildSelection = useCallback((): GridSelection<TData> => {
    const rows = rowDataRef.current;
    const indices: number[] = [];
    selectedRows.forEach((i) => {
      if (i >= 0 && i < rows.length) indices.push(i);
    });
    indices.sort((a, b) => a - b);
    return { indices, rows: indices.map((i) => rows[i]) };
  }, [selectedRows]);

  useImperativeHandle(
    gridRef,
    /**
     * Exposes the imperative selection API on `gridRef.current`.
     *
     * Consumer-facing methods:
     * - `getSelectedRows`: returns current `{ rows, indices }` snapshot.
     * - `clearSelection`: clears checkbox selection state in-grid.
     *
     * This is intentionally a small API surface to keep external integration
     * stable while still supporting toolbar-like actions (delete/export/etc.).
     */
    () => ({
      getSelectedRows: () => buildSelection(),
      clearSelection,
    }),
    [buildSelection, clearSelection],
  );

  useEffect(() => {
    /**
     * Emits fresh selection snapshot whenever checkbox selection changes.
     *
     * Callback is read from ref to avoid unnecessary effect re-runs when parent
     * re-creates the handler function.
     */
    onSelectionChangedRef.current?.(buildSelection());
  }, [buildSelection]);

  const rootClassName = [styles.gridContainer, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className={rootClassName} role="table">
      <div className={styles.inner}>
        <GridHeader columnDefs={columnDefs} />
        <GridBody
          columnDefs={columnDefs}
          rowData={internalRowData}
          rowIndices={bodyRowIndices}
          toggleRow={toggleRow}
          isSelected={isSelected}
          onCellValueChange={updateCellValue}
          height={bodyHeight}
          rowHeight={BODY_ROW_H}
        />
        {resolvedFooterIndex === undefined ? null : (
          <GridFooter
            columnDefs={columnDefs}
            rowData={internalRowData}
            footerRowIndex={resolvedFooterIndex}
            toggleRow={toggleRow}
            isSelected={isSelected}
            onCellValueChange={updateCellValue}
          />
        )}
      </div>
    </div>
  );
};

export default Grid;
