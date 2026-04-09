/**
 * @fileoverview Public entry point for the Grid component library.
 *
 * Import the component and its types from this single path so that internal
 * file locations remain an implementation detail and can be refactored without
 * breaking consumer imports.
 *
 * @example
 * // Component
 * import { Grid } from '@/_components/grid';
 *
 * // Types (for defining column schemas on a page)
 * import type { ColumnDef, GridProps } from '@/_components/grid';
 */

export { default as Grid } from "./Grid";
export type { ColumnDef, GridProps } from "./helpers/types/types";
