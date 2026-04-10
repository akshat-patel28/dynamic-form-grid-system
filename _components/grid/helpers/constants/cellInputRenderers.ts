/**
 * Registry of supported inline cell-input renderer identifiers.
 *
 * Use these values for `ColumnDef.cellInputRenderer` instead of raw strings
 * to avoid typos and enable auto-complete.
 *
 * @example
 * import { CELL_INPUT_RENDERERS } from '@/_components/grid';
 * const col: ColumnDef = { field: 'name', cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT };
 */
export const CELL_INPUT_RENDERERS = {
  TEXT_INPUT: "textInput",
} as const;

/** Union of all supported cell-input renderer string values. */
export type CellInputRenderer =
  (typeof CELL_INPUT_RENDERERS)[keyof typeof CELL_INPUT_RENDERERS];
