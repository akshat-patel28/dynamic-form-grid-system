/**
 * @fileoverview Client-side pagination UI (MUI) with optional item count summary.
 *
 * @remarks
 * **Scope:** Presents page controls and a short text summary only. It does not know
 * about grids, steppers, or URLs — wire `onPageChange` to your data layer.
 *
 * **Accessibility:** Delegates keyboard and ARIA behavior to MUI `Pagination`.
 *
 * @example
 * ```tsx
 * <DataPagination
 *   page={apiPage}
 *   totalPages={9}
 *   totalItems={82}
 *   disabled={loading}
 *   onPageChange={(page) => setApiPage(page)}
 * />
 * ```
 */

"use client";

import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";

import type { DataPaginationProps } from "./types";

/**
 * Renders MUI `Pagination` plus a secondary `Typography` line: `Page {page} of {totalPages}`
 * and, when `totalItems` is defined, ` ({totalItems} total)`.
 *
 * @remarks
 * **Early exit:** Returns `null` if `totalPages <= 0` so callers need not branch in JSX.
 *
 * **Styling:** Uses a flex `Box` with `gap` and `flexWrap` so the summary wraps on
 * narrow viewports.
 *
 * @param props - {@link DataPaginationProps}
 * @returns Pagination row element, or `null` when `totalPages` is not positive.
 *
 * @example
 * ```tsx
 * <DataPagination
 *   page={currentPage}
 *   totalPages={totalPages}
 *   totalItems={totalCount}
 *   disabled={isLoading}
 *   onPageChange={(p) => setCurrentPage(p)}
 * />
 * ```
 */
const DataPagination = ({
  page,
  totalPages,
  totalItems,
  disabled = false,
  onPageChange,
}: DataPaginationProps) => {
  if (totalPages <= 0) return null;

  /**
   * Adapts MUI `Pagination`’s `(event, page)` signature to the simpler `onPageChange(page)` API.
   *
   * @param _event - MUI passes a change event; unused here.
   * @param value - One-based page index from MUI (matches {@link DataPaginationProps.page}).
   */
  const handleChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    onPageChange(value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Pagination
        count={totalPages}
        page={page}
        onChange={handleChange}
        size="small"
        disabled={disabled}
      />
      <Typography variant="body2" color="text.secondary">
        Page {page} of {totalPages}
        {totalItems != null && (
          <span> ({totalItems} total)</span>
        )}
      </Typography>
    </Box>
  );
};

export default DataPagination;
