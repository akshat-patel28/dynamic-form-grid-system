import type { ColumnDef } from './types';
import styles from './grid.module.css';

/**
 * Props for the `GridHeader` component.
 */
interface GridHeaderProps {
  /**
   * Column definitions that drive the header cells.
   * Each entry produces exactly one `<div>` cell in the sticky header row.
   */
  columnDefs: ColumnDef[];
}

/**
 * GridHeader
 *
 * Renders the sticky header row of the grid. The row is position-sticky so it
 * remains visible as the user scrolls the body vertically inside the grid
 * container.
 *
 * Each column defined in `columnDefs` produces one header cell. If a column's
 * `headerName` is omitted the column's `field` value is used as the display
 * label, ensuring the header is never blank and always maps visually to its
 * corresponding body cells.
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
const GridHeader = ({ columnDefs }: GridHeaderProps) => {
  return (
    <div className={styles.headerRow} role="row">
      {columnDefs.map((col) => (
        <div
          key={col.field}
          className={styles.headerCell}
          style={{ maxWidth: col.maxWidth }}
          role="columnheader"
        >
          {col.headerName ?? col.field}
        </div>
      ))}
    </div>
  );
};

export default GridHeader;
