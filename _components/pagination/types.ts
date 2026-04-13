/**
 * @fileoverview Type definitions for {@link DataPaginationProps}.
 *
 * Keeps the public contract in one place so both the component implementation
 * and consumers share a single source of truth.
 *
 * @example
 * ```ts
 * import type { DataPaginationProps } from "@/_components/pagination";
 *
 * const props: DataPaginationProps = {
 *   page: 1,
 *   totalPages: 10,
 *   totalItems: 97,
 *   onPageChange: (p) => console.log(p),
 * };
 * ```
 */

/**
 * Public props for the default-export pagination bar component.
 *
 * @remarks
 * **One-based pages:** Matches MUI
 * {@link https://mui.com/material-ui/api/pagination/ Pagination}’s `page` / `count`
 * semantics and common REST query params (`?page=1` is the first page).
 *
 * **Parent responsibilities:** This component does not fetch data. When `onPageChange`
 * fires, the parent should update server/query state, set `page` from the response,
 * and pass new `totalPages` / `totalItems` when known.
 *
 * **Empty state:** If `totalPages <= 0`, the component returns `null` (no UI).
 */
export interface DataPaginationProps {
  /**
   * Active page index, **one-based** (first page is `1`).
   * Should stay in sync with your API or cursor logic.
   */
  page: number;

  /**
   * Total page count (`Pagination`’s `count`). If `0` or negative, nothing is rendered.
   */
  totalPages: number;

  /**
   * Optional grand total of items across all pages. When set, the summary line appends
   * `(N total)` after “Page X of Y”. Omit to hide the count (e.g. unknown total).
   */
  totalItems?: number;

  /**
   * Disables the MUI `Pagination` control (e.g. while `isLoading`).
   *
   * @defaultValue `false`
   */
  disabled?: boolean;

  /**
   * Invoked after the user picks a page in the control.
   *
   * @param page - One-based destination page (same convention as `page` prop).
   */
  onPageChange: (page: number) => void;
}
