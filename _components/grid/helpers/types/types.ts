/**
 * @fileoverview Public TypeScript types for the Grid component library.
 *
 * Import these types on any page or feature file when defining a column schema
 * or passing props to `<Grid />`.
 *
 * @example
 * import type { ColumnDef, GridProps, FocusedCell, GridCellRendererProps, ValidateCellValueParams } from '@/_components/grid';
 */

import type { CSSProperties } from "react";
import type { CellInputRenderer } from "../constants/cellInputRenderers";
import type { DropdownOption } from "../../../inputs/DropdownInput";

/**
 * Arguments passed to {@link ColumnDef.validateCellValue} for a single draft value.
 *
 * @template TData Shape of a single row data object.
 */
export interface ValidateCellValueParams<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Draft value being validated (committed cell value is `rowData[field]`). */
  value: unknown;
  /** Full row object for the cell’s row. */
  rowData: TData;
  /** Column field key. */
  field: string;
  /** Zero-based row index in the grid’s `rowData`. */
  rowIndex: number;
}

/**
 * Defines the configuration for a single column in the grid.
 *
 * @template TData Shape of a single row data object. Defaults to
 *   `Record<string, unknown>` when not specified.
 *
 * @example
 * type Employee = { id: number; name: string; salary: number };
 *
 * const columns: ColumnDef<Employee>[] = [
 *   { headerName: 'Name',   field: 'name' },
 *   { headerName: 'Status', field: 'status', maxWidth: '120px', cellClass: 'text-center' },
 *   {
 *     headerName: 'Salary',
 *     field: 'salary',
 *     valueFormatter: ({ rowData }) => `$${rowData.salary.toFixed(2)}`,
 *   },
 * ];
 */
export interface ColumnDef<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Text displayed in the column header.
   * If omitted, `GridHeader` falls back to `field` so the label is never blank.
   */
  headerName?: string;

  /**
   * The key used to read the cell value from each row data object.
   * Must match a property name on the row data.
   */
  field: string;

  /**
   * One or more CSS class names applied to every non-checkbox data cell in this column
   * (body and sticky footer rows).
   * Use for alignment helpers such as `'text-center'`.
   */
  cellClass?: string;

  /**
   * One or more CSS class names applied to the header cell of this column.
   * Use to customise header alignment, colour, or typography per column.
   *
   * @example
   * headerCellClassName: 'text-right font-mono'
   */
  headerCellClassName?: string;

  /**
   * One or more CSS class names applied to every non-checkbox data cell in this column
   * (`GridBody` and sticky `GridFooter` both use `GridCellRenderer`).
   *
   * @example
   * bodyCellClassName: 'text-right text-green-600'
   */
  bodyCellClassName?: string;

  /**
   * Preferred width of the column (header and data cells).
   * Accepts any valid CSS width value, e.g. `'100px'` or `'10rem'`.
   */
  width?: string;

  /**
   * Minimum width of the column (header and data cells).
   * Accepts any valid CSS width value, e.g. `'100px'` or `'10rem'`.
   */
  minWidth?: string;

  /**
   * Maximum width of the column (header and data cells).
   * Accepts any valid CSS width value, e.g. `'100px'` or `'10rem'`.
   * When omitted the column grows freely with `flex: 1`.
   */
  maxWidth?: string;

  /**
   * Optional formatter applied to a cell before it is rendered.
   * Receives the entire row object so the formatter can derive its output
   * from any combination of fields. Must return the display string.
   * When omitted the raw `row[field]` value is coerced to a string directly.
   *
   * @param params.rowData - The full row data object for this cell's row.
   * @returns The formatted string to display in the cell.
   *
   * @example
   * // Currency — uses only the target field
   * valueFormatter: ({ rowData }) => `$${Number(rowData.price).toFixed(2)}`
   *
   * // Composite — combines multiple fields
   * valueFormatter: ({ rowData }) => `${rowData.firstName} ${rowData.lastName}`
   *
   * // Date
   * valueFormatter: ({ rowData }) => new Date(String(rowData.createdAt)).toLocaleDateString()
   */
  valueFormatter?: (params: { rowData: TData }) => string;

  /**
   * Whether this column’s cells can enter inline edit mode on double-click.
   * Use `true` / `false` for all rows, or a function to decide per `rowData`.
   * Inline editing also requires `cellInputRenderer` on the same column.
   */
  editable?: boolean | ((params: { rowData: TData }) => boolean);

  /**
   * Determines which input component to render inline when a cell is
   * double-clicked and `editable` resolves to `true` for that row.
   * Use values from `CELL_INPUT_RENDERERS` to avoid spelling mistakes.
   * When omitted, the cell does not show an inline editor.
   */
  cellInputRenderer?: CellInputRenderer;

  /**
   * List of selectable options for dropdown-based inline editors.
   * Required when `cellInputRenderer` is `CELL_INPUT_RENDERERS.DROPDOWN_INPUT`.
   *
   * @example
   * cellInputOptions: [
   *   { value: "active", label: "Active" },
   *   { value: "inactive", label: "Inactive" },
   * ]
   */
  cellInputOptions?: DropdownOption[];

  /**
   * Optional per-cell validator for the draft value before commit.
   * Return `null` when valid, or a non-empty error string when invalid.
   * While editing text-like inputs, invalid drafts set the field’s `error` state;
   * on failed commit (blur, Enter, switch, dropdown), `toast.error` runs, the
   * value reverts to the last committed `rowData[field]`, and the grid is not updated.
   */
  validateCellValue?: (
    params: ValidateCellValueParams<TData>,
  ) => string | null;

  /**
   * When `true`, this column renders a checkbox instead of data.
   * Checking the checkbox highlights the entire row.
   * Only one column in the array should have this enabled.
   */
  checkboxSelection?: boolean;
}

/**
 * Payload passed to `onCellValueChanged` after a cell value is committed.
 *
 * @template TData Shape of a single row data object.
 */
export interface OnCellValueChangedParams<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Zero-based row index of the changed cell. */
  rowIndex: number;

  /** Column field key whose value changed. */
  field: string;

  /** Value before the edit. */
  oldValue: unknown;

  /** Newly committed value. */
  newValue: unknown;

  /** Snapshot of the full row data *before* the edit was applied. */
  rowData: TData;

  /**
   * Call this to revert the cell back to `oldValue` in the grid's internal
   * state — useful when an API call fails after an optimistic local update.
   */
  revert: () => void;
}

/**
 * Props accepted by the `<Grid />` component.
 *
 * @template TData Shape of a single row data object. Defaults to
 *   `Record<string, unknown>` when not specified.
 *
 * @example
 * type Employee = { id: number; name: string; department: string };
 *
 * const props: GridProps<Employee> = {
 *   columnDefs: [{ headerName: 'Name', field: 'name' }],
 *   rowData: [
 *     { id: 1, name: 'Alice', department: 'Engineering' },
 *     { id: 2, name: 'Bob', department: 'Sales' },
 *   ],
 *   stickyFooterRowIndex: 1,
 * };
 */
export interface GridProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Column definitions that control the structure and appearance of the grid.
   * Rendered left-to-right in the order provided.
   */
  columnDefs: ColumnDef<TData>[];

  /**
   * Array of row data objects to display.
   * Each object's properties are accessed via the `field` key defined in
   * the corresponding `ColumnDef`. An empty array renders the empty state.
   * The `Grid` component shallow-clones this array and each row on mount for
   * internal updates from inline cell editing.
   */
  rowData: TData[];

  /**
   * Fires after a cell value is committed locally (on blur or Enter).
   * Receives the old value, new value, and a `revert` callback to roll back
   * the change — typically called when a subsequent API save fails.
   */
  onCellValueChanged?: (params: OnCellValueChangedParams<TData>) => void;

  /**
   * When set to an integer in `0 .. rowData.length - 1`, that row is omitted from the
   * scrollable body and rendered once in a sticky footer at the bottom of the grid
   * (horizontal scroll stays aligned with columns). Non-integers and out-of-range
   * values are ignored (no footer).
   */
  stickyFooterRowIndex?: number;

  /**
   * Optional extra CSS class name(s) for the scrollable grid root (`role="table"`),
   * merged with the internal container class. Use for layout constraints such as
   * `max-height` in a CSS module.
   */
  className?: string;
}

/**
 * Identifies the focused data cell by row and column index.
 * Parents (`GridBody`, `GridFooter`) each keep their own `FocusedCell | null` state.
 */
export interface FocusedCell {
  rowIndex: number;
  colIndex: number;
}

/**
 * Props for the default body cell component (`GridCellRenderer`) for non-checkbox columns.
 *
 * @template TData Shape of a single row object.
 */
export interface GridCellRendererProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Column definition for this cell — field, formatter, sizing, classes,
   * `editable`, and `cellInputRenderer` for inline editing.
   */
  columnDef: ColumnDef<TData>;

  /**
   * Full row object; the cell renderer resolves the visible string from the column’s
   * `valueFormatter` or `field` (see `GridCellRenderer`).
   */
  row: TData;

  /**
   * Which cell currently has focus in the parent (`GridBody` or `GridFooter`), or `null`
   * when focus is elsewhere. Compared to `rowIndex` / `colIndex` for the focus outline.
   */
  focusedCell: FocusedCell | null;

  /** Inline width constraints from the column definition; `undefined` when none apply. */
  cellStyle: CSSProperties | undefined;

  /**
   * Zero-based index of this row in the grid’s full `rowData` array (same index the parent
   * passes to `onCellValueChange`).
   */
  rowIndex: number;

  /** Zero-based column index within `columnDefs` (including checkbox column if present). */
  colIndex: number;

  /** Called when the cell receives focus; parent typically records `{ rowIndex, colIndex }`. */
  onFocus: () => void;

  /** Called when the cell loses focus; parent typically clears the focused-cell state. */
  onBlur: () => void;

  /** Called when the user commits an edited value (blur or Enter). */
  onCellValueChange: (rowIndex: number, field: string, value: unknown) => void;
}
