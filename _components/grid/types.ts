/**
 * @fileoverview Public TypeScript types for the Grid component library.
 *
 * Import these types on any page or feature file when defining a column schema
 * or passing props to `<Grid />`.
 *
 * @example
 * import type { ColumnDef, GridProps } from '@/_components/grid';
 */

/**
 * Defines the configuration for a single column in the grid.
 *
 * @example
 * const columns: ColumnDef[] = [
 *   { headerName: 'Name',   field: 'name' },
 *   { headerName: 'Status', field: 'status', maxWidth: '120px', cellClass: 'text-center' },
 * ];
 */
export interface ColumnDef {
  /**
   * Text displayed in the column header.
   * If omitted the header cell renders empty.
   */
  headerName?: string;

  /**
   * The key used to read the cell value from each row data object.
   * Must match a property name on the row data.
   */
  field: string;

  /**
   * One or more CSS class names applied to every data cell in this column.
   * Use for alignment helpers such as `'text-center'`.
   */
  cellClass?: string;

  /**
   * Maximum width of the column (header and data cells).
   * Accepts any valid CSS width value, e.g. `'100px'` or `'10rem'`.
   * When omitted the column grows freely with `flex: 1`.
   */
  maxWidth?: string;
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
 *   rowData: [{ id: 1, name: 'Alice', department: 'Engineering' }],
 * };
 */
export interface GridProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Column definitions that control the structure and appearance of the grid.
   * Rendered left-to-right in the order provided.
   */
  columnDefs: ColumnDef[];

  /**
   * Array of row data objects to display.
   * Each object's properties are accessed via the `field` key defined in
   * the corresponding `ColumnDef`. An empty array renders the empty state.
   */
  rowData: TData[];
}
