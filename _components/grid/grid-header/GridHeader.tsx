import { getColumnCellStyle } from "../helpers/utils/columnSizingStyle";
import type { ColumnDef } from "../helpers/types/types";
import styles from "../grid.module.css";

/**
 * Props for the `GridHeader` component.
 *
 * @template TData Shape of a single row data object. Defaults to
 *   `Record<string, unknown>` when not specified.
 */
interface GridHeaderProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Column definitions that drive the header cells.
   * Each entry produces exactly one `<div>` cell in the sticky header row.
   */
  columnDefs: ColumnDef<TData>[];
}

/**
 * GridHeader
 *
 * Renders the sticky header row of the grid. The row is position-sticky so it
 * remains visible as the user scrolls the body vertically inside the grid
 * container.
 *
 * Each column defined in `columnDefs` produces one header cell. Checkbox columns render
 * an empty header cell (selection UI lives in each body/footer row). If `headerName` is
 * omitted for a data column, `field` is shown as the label so the header stays aligned
 * with body cells.
 *
 * @param props - {@link GridHeaderProps}
 * @returns A single sticky `<div>` row containing one header cell per column.
 *
 * @example
 * <GridHeader
 *   columnDefs={[
 *     { headerName: 'ID',   field: 'id',   maxWidth: '80px' },
 *     { headerName: 'Name', field: 'name' },
 *   ]}
 * />
 */
const GridHeader = <
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  columnDefs,
}: GridHeaderProps<TData>) => {
  return (
    <div className={styles.headerRow} role="row">
      {columnDefs.map((col) => {
        if (col.checkboxSelection) {
          return (
            <div
              key={col.field}
              className={`${styles.headerCell} ${styles.checkboxCell}`}
              role="columnheader"
            />
          );
        }

        return (
          <div
            key={col.field}
            className={[styles.headerCell, col.headerCellClassName]
              .filter(Boolean)
              .join(" ")}
            style={getColumnCellStyle(col)}
            role="columnheader"
          >
            {col.headerName ?? col.field}
          </div>
        );
      })}
    </div>
  );
};

export default GridHeader;
