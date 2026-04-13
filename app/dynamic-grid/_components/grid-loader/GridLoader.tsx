"use client";

/**
 * @fileoverview Loading placeholder for the dynamic-grid page.
 *
 * Mirrors {@link PageLoader} (MUI `Skeleton`, `aria-busy`) but lays out a
 * scrollable table-like shell aligned with `<Grid />`: one header band, several
 * body rows, and an optional sticky footer band. Pass the same `columnDefs` as
 * the real grid so checkbox width and `maxWidth` / `minWidth` / `width` hints
 * match the live column layout.
 */

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { ColumnDef } from "@/_components/grid";

const HEADER_BAND_HEIGHT = 47;
const BODY_ROW_HEIGHT = 42;

type ColumnShellSx = {
  flex: string;
  width?: string;
  minWidth: string;
  maxWidth?: string;
  boxSizing: "border-box";
};

function columnShellSx<T extends Record<string, unknown>>(
  col: ColumnDef<T>,
): ColumnShellSx {
  if (col.checkboxSelection) {
    return {
      flex: "none",
      width: "48px",
      minWidth: "48px",
      boxSizing: "border-box",
    };
  }
  const fixed = col.maxWidth ?? col.width ?? col.minWidth;
  if (fixed) {
    return {
      flex: "none",
      width: fixed,
      minWidth: fixed,
      maxWidth: fixed,
      boxSizing: "border-box",
    };
  }
  return {
    flex: "1 1 200px",
    minWidth: "200px",
    boxSizing: "border-box",
  };
}

export type GridLoaderProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  /**
   * Same column schema as `<Grid columnDefs={…} />` — drives skeleton column
   * count and widths.
   */
  columnDefs: ColumnDef<T>[];
  /**
   * Number of placeholder body rows (default matches a typical API page).
   */
  rowCount?: number;
  /** When `true`, renders an extra band resembling the sticky totals footer. */
  showFooterRow?: boolean;
  /** Applied to the scrollable root (e.g. CSS module `max-height` for the grid viewport). */
  className?: string;
};

function SkeletonRow<T extends Record<string, unknown>>({
  columnDefs,
  height,
  rowKey,
  footer = false,
}: Readonly<{
  columnDefs: ColumnDef<T>[];
  height: number;
  rowKey: string;
  footer?: boolean;
}>) {
  return (
    <Box
      sx={{
        display: "flex",
        width: "max-content",
        minWidth: "100%",
        ...(footer
          ? {
              position: "sticky",
              bottom: 0,
              zIndex: 1,
              backgroundColor: "#f1f5f9",
              boxShadow: "0 -1px 0 #e2e8f0",
            }
          : {}),
      }}
    >
      {columnDefs.map((col) => (
        <Box
          key={`${rowKey}-${col.field}`}
          sx={{
            ...columnShellSx(col),
            height,
            boxSizing: "border-box",
            borderRight: "1px solid #e2e8f0",
            borderBottom: footer ? "none" : "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            px: "12px",
            py: "10px",
          }}
        >
          <Skeleton
            variant="rounded"
            height={Math.max(12, height - 20)}
            width="100%"
            animation="wave"
          />
        </Box>
      ))}
    </Box>
  );
}

/**
 * Skeleton layout shown while grid data is loading — analogous to the form
 * route’s `PageLoader`.
 */
export default function GridLoader<
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  columnDefs,
  rowCount = 8,
  showFooterRow = true,
  className,
}: Readonly<GridLoaderProps<T>>) {
  return (
    <Box
      component="section"
      aria-busy="true"
      aria-label="Loading grid"
      className={className}
      sx={{
        width: "100%",
        overflow: "auto",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <SkeletonRow
        columnDefs={columnDefs}
        height={HEADER_BAND_HEIGHT}
        rowKey="header"
      />
      {Array.from({ length: rowCount }, (_, i) => (
        <SkeletonRow
          key={`body-${i}`}
          columnDefs={columnDefs}
          height={BODY_ROW_HEIGHT}
          rowKey={`body-${i}`}
        />
      ))}
      {showFooterRow ? (
        <SkeletonRow
          columnDefs={columnDefs}
          height={BODY_ROW_HEIGHT}
          rowKey="footer"
          footer
        />
      ) : null}
    </Box>
  );
}
