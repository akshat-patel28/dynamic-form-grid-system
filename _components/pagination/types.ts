/**
 * @fileoverview Types for the standalone DataPagination component.
 *
 * @example
 * import type { DataPaginationProps } from '@/_components/pagination';
 */

/**
 * Props accepted by the `<DataPagination />` component.
 *
 * All page values are **one-based** to match MUI `<Pagination />`
 * and typical REST API `?page=N` conventions.
 */
export interface DataPaginationProps {
  /**
   * The currently active page (one-based).
   */
  page: number;

  /**
   * Total number of pages available.
   * When `<= 0` the component renders nothing.
   */
  totalPages: number;

  /**
   * Optional total item count displayed in the summary label.
   * When omitted the "(N total)" suffix is hidden.
   */
  totalItems?: number;

  /**
   * When `true`, the pagination controls are visually disabled
   * (e.g. during a loading state).
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Called when the user selects a different page.
   *
   * @param page - One-based page number the user navigated to.
   */
  onPageChange: (page: number) => void;
}
