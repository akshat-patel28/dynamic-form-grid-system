import type { GridProps } from "./helpers/types/types";
import GridHeader from "./grid-header/GridHeader";
import GridBody from "./grid-body/GridBody";
import styles from "./grid.module.css";

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
 * └─────────────────────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Horizontal scrolling
 * Each cell has `min-width: 200px` and `flex: 1`. When the combined minimum
 * width of all columns exceeds the container width (e.g. 20+ columns), the
 * container scrolls horizontally. No extra configuration is required.
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
 *   return <Grid columnDefs={columns} rowData={rows} />;
 * }
 * ```
 *
 * @template TData Shape of a single row data object.
 *   Defaults to `Record<string, unknown>` when not specified.
 *
 * @param props - {@link GridProps}
 * @returns The full grid including header and body wrapped in a scrollable container.
 */
const Grid = <TData extends Record<string, unknown> = Record<string, unknown>>({
  columnDefs,
  rowData,
}: GridProps<TData>) => {
  return (
    <div className={styles.gridContainer} role="table">
      <GridHeader columnDefs={columnDefs} />
      <GridBody columnDefs={columnDefs} rowData={rowData} />
    </div>
  );
};

export default Grid;
