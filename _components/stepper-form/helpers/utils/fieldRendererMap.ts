/**
 * @fileoverview Maps `CellInputRenderer` identifiers to the corresponding
 * HTML input `type` attribute used by MUI `<TextField />`.
 *
 * This utility is the form-side equivalent of the grid's cell-renderer
 * switch. It keeps the mapping in one place so that `StepperFormFields`
 * does not need to know about individual renderer strings.
 *
 * @example
 * import { getInputType } from './fieldRendererMap';
 * const type = getInputType('numberInput'); // "number"
 */

import {
  CELL_INPUT_RENDERERS,
  type CellInputRenderer,
} from "@/_components/grid/helpers/constants/cellInputRenderers";

/**
 * Lookup table from `CellInputRenderer` value to HTML input `type`.
 *
 * | Renderer key      | HTML type  |
 * |------------------|------------|
 * | `"textInput"` | `"text"`   |
 * | `"textareaInput"` | `"text"`   |
 * | `"numberInput"`   | `"number"` |
 * | `"emailInput"`    | `"email"`  |
 * | `"dateInput"`     | `"date"`   |
 */
const RENDERER_TO_INPUT_TYPE: Record<CellInputRenderer, string> = {
  textInput: "text",
  textareaInput: "text",
  numberInput: "number",
  emailInput: "email",
  dateInput: "date",
};

/**
 * Resolves the HTML input `type` for a given `CellInputRenderer` identifier.
 *
 * @param renderer - One of the `CellInputRenderer` string values, or
 *   `undefined` when the field definition omits `inputRenderer`.
 * @returns The corresponding HTML input `type` string.
 *   Defaults to `"text"` when `renderer` is `undefined` or unrecognised.
 *
 * @example
 * getInputType('emailInput');  // "email"
 * getInputType(undefined);     // "text"
 */
export function getInputType(renderer: CellInputRenderer | undefined): string {
  if (!renderer) return "text";
  return RENDERER_TO_INPUT_TYPE[renderer] ?? "text";
}

/**
 * Whether the renderer should use a multiline MUI `TextField` (`textarea`).
 */
export function isTextareaRenderer(
  renderer: CellInputRenderer | undefined,
): boolean {
  return renderer === CELL_INPUT_RENDERERS.TEXTAREA_INPUT;
}
