/**
 * @fileoverview Standalone data-pagination component.
 *
 * A reusable, API-agnostic pagination bar built on MUI `<Pagination />`.
 * It is completely independent of any form or grid — it simply tells the
 * parent which page the user selected and displays the current position.
 *
 * The parent is responsible for fetching data when the page changes.
 *
 * @example
 * <DataPagination
 *   page={apiPage}
 *   totalPages={9}
 *   totalItems={82}
 *   disabled={loading}
 *   onPageChange={(page) => setApiPage(page)}
 * />
 */

"use client";

import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";

import type { DataPaginationProps } from "./types";

/**
 * DataPagination
 *
 * Renders an MUI `<Pagination />` bar with an optional summary label
 * ("Page X of Y (Z total)"). Works the same way regardless of whether
 * the consuming page renders a grid, a stepper form, or a plain list.
 *
 * All page numbers are **one-based** (matching the MUI convention and
 * typical REST API `?page=N` parameters).
 *
 * @param props - {@link DataPaginationProps}
 * @returns The pagination bar, or `null` when there are no pages to show.
 *
 * @example
 * <DataPagination
 *   page={currentPage}
 *   totalPages={totalPages}
 *   totalItems={totalCount}
 *   disabled={isLoading}
 *   onPageChange={(p) => setCurrentPage(p)}
 * />
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
   * Forwards MUI's page-change event to the consumer.
   *
   * @param _event - React synthetic event (unused).
   * @param value  - One-based page number selected by the user.
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
