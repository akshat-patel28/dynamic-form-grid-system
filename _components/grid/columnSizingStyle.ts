import type { CSSProperties } from "react";
import type { ColumnDef } from "./types";

/**
 * Inline styles for header/body cells from column width constraints.
 * When only `maxWidth` is set (legacy), both `minWidth` and `maxWidth` use
 * that value so the column stays a fixed size.
 */
export function getColumnCellStyle(
  col: Pick<ColumnDef, "width" | "minWidth" | "maxWidth">,
): CSSProperties | undefined {
  const { width, minWidth, maxWidth } = col;
  if (!width && !minWidth && !maxWidth) return undefined;

  const style: CSSProperties = {};
  if (width) style.width = width;
  if (minWidth !== undefined) style.minWidth = minWidth;
  else if (maxWidth && !width) style.minWidth = maxWidth;
  if (maxWidth) style.maxWidth = maxWidth;
  return style;
}
