"use client";
import { memo, useMemo, useState } from "react";
import {
  FixedSizeList,
  areEqual,
  type ListChildComponentProps,
} from "react-window";
import { ToastContainer } from "react-toastify";
import { getColumnCellStyle } from "../helpers/utils/columnSizingStyle";
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

  /**
   * Toggles selection for the row at the given index. Must match the `toggleRow`
   * from parent `Grid` so body and sticky footer stay in sync.
   */
  toggleRow: (rowIndex: number) => void;

  /** Whether the row at the given index is selected (checkbox column). */
  isSelected: (rowIndex: number) => boolean;

  /**
   * Vertical pixel height available to the virtualized list. The parent `Grid`
   * measures this from its outer container via `ResizeObserver` so the list
   * fills the remaining space between header and optional sticky footer.
   */
  height: number;

  /** Fixed pixel height for a single body row; used as `FixedSizeList.itemSize`. */
  rowHeight: number;
}

/**
 * Shape of the `itemData` passed to `FixedSizeList`. Packaging everything a
 * `Row` needs into one memoized object keeps the list itself stable across
 * renders and lets `React.memo(Row, areEqual)` skip work when neither the
 * absolute index nor the shared data changed.
 */
interface RowItemData<TData extends Record<string, unknown>> {
  columnDefs: ColumnDef<TData>[];
  rowData: TData[];
  rowIndices: number[];
  hasCheckboxColumn: boolean;
  focusedCell: FocusedCell | null;
  setFocusedCell: (cell: FocusedCell | null) => void;
  onCellValueChange: (rowIndex: number, field: string, value: unknown) => void;
  toggleRow: (rowIndex: number) => void;
  isSelected: (rowIndex: number) => boolean;
}

/**
 * GridBody
 *
 * Renders the scrollable data section of the grid. Body rows are virtualized
 * with `react-window`'s `FixedSizeList`, so only the rows intersecting the
 * visible viewport (plus a small `overscanCount`) are mounted in the DOM.
 *
 * ### Layout
 * The parent `Grid` measures its outer container and passes `height` here.
 * The list's outer element uses `overflow-y: auto; overflow-x: hidden` so
 * vertical scroll stays local; horizontal scroll is owned by the parent's
 * outer wrapper, which is why header, body, and footer stay aligned without
 * any JavaScript `scrollLeft` synchronization.
 *
 * ### Cell value resolution
 * Non-checkbox cells use `GridCellRenderer`, which resolves display text with
 * `valueFormatter` when set, otherwise `row[col.field]` with null-safe string
 * coercion.
 *
 * ### Keyboard navigation
 * Every mounted cell is focusable (`tabIndex={0}`). Pressing **Tab** advances
 * focus to the next cell in natural DOM order; **Shift + Tab** moves
 * backwards. Because virtualization only mounts visible rows, Tab traversal
 * stops at the last visible row. Scrolling brings more rows into the DOM and
 * Tab continues naturally from the next focusable element.
 *
 * ### Focus highlight
 * Focus state is lifted here; `GridCellRenderer` applies `bodyCellFocused`
 * when indices match so the active cell stays visible for keyboard nav.
 *
 * ### Row selection
 * A column with `checkboxSelection: true` renders a checkbox per row.
 * Selection state is controlled by the parent via `toggleRow` / `isSelected`.
 *
 * ### Striping
 * Alternate-row background uses absolute `rowIndex` (not DOM index) via the
 * `.bodyRowAlt` class because virtualized rows always start at DOM index 0.
 *
 * ### Toasts
 * A `ToastContainer` is rendered as a sibling of the list so copy actions in
 * `GridCellRenderer` can show transient feedback without being remounted as
 * rows scroll in and out.
 *
 * ### Empty state
 * When `rowData` is an empty array a centred "No Records Found" message is
 * rendered. When `rowData` has rows but `rowIndices` is empty, only the toast
 * host is rendered (e.g. sticky footer holds the only visible row).
 *
 * @param props - {@link GridBodyProps}
 * @returns An empty-state block, or a `FixedSizeList` of virtualized rows
 *   accompanied by the `ToastContainer`.
 */
const GridBody = <TData extends Record<string, unknown>>({
  columnDefs,
  rowData,
  rowIndices,
  onCellValueChange,
  toggleRow,
  isSelected,
  height,
  rowHeight,
}: GridBodyProps<TData>) => {
  /**
   * Tracks which cell currently has keyboard / pointer focus.
   * `null` when no cell is focused (e.g. focus is outside the grid).
   */
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);
  const hasCheckboxColumn = columnDefs.some((col) => col.checkboxSelection);

  const itemData = useMemo<RowItemData<TData>>(
    () => ({
      columnDefs,
      rowData,
      rowIndices,
      hasCheckboxColumn,
      focusedCell,
      setFocusedCell,
      onCellValueChange,
      toggleRow,
      isSelected,
    }),
    [
      columnDefs,
      rowData,
      rowIndices,
      hasCheckboxColumn,
      focusedCell,
      onCellValueChange,
      toggleRow,
      isSelected,
    ],
  );

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

  if (rowData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.noData}>No Records Found</p>
      </div>
    );
  }

  if (rowIndices.length === 0) {
    return <>{toastHost}</>;
  }

  return (
    <>
      <FixedSizeList
        height={Math.max(0, height)}
        itemCount={rowIndices.length}
        itemSize={rowHeight}
        width="100%"
        itemData={itemData as RowItemData<Record<string, unknown>>}
        overscanCount={8}
        className={styles.virtualList}
      >
        {GridBodyRow}
      </FixedSizeList>
      {toastHost}
    </>
  );
};

/**
 * Renders one virtualized body row. Memoized with `areEqual` so scroll-driven
 * re-renders only remount the rows whose `index` or shared `data` actually
 * changed. The `style` arg is required by react-window — it carries the
 * absolute position / size for each row and must be applied to the row div.
 */
const GridBodyRowImpl = <TData extends Record<string, unknown>>({
  index,
  style,
  data,
}: ListChildComponentProps<RowItemData<TData>>) => {
  const {
    columnDefs,
    rowData,
    rowIndices,
    hasCheckboxColumn,
    focusedCell,
    setFocusedCell,
    onCellValueChange,
    toggleRow,
    isSelected,
  } = data;

  const rowIndex = rowIndices[index];
  const row = rowData[rowIndex];
  const rowSelected = hasCheckboxColumn && isSelected(rowIndex);

  const rowClass = [
    styles.bodyRow,
    rowIndex % 2 === 1 ? styles.bodyRowAlt : "",
    rowSelected ? styles.bodyRowSelected : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div style={style} className={rowClass} role="row">
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
};

/**
 * react-window calls its item renderer with a `ListChildComponentProps` whose
 * `data` generic is erased at the call site, so we re-type the memoized
 * wrapper using `unknown` and cast back inside the impl.
 */
const GridBodyRow = memo(
  GridBodyRowImpl as (
    props: ListChildComponentProps<RowItemData<Record<string, unknown>>>,
  ) => ReturnType<typeof GridBodyRowImpl>,
  areEqual,
);

export default GridBody;
