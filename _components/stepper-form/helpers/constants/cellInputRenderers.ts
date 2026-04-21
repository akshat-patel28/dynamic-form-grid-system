/**
 * Registry of supported field input renderer identifiers.
 *
 * Use these values for `FormFieldDef.inputRenderer` instead of raw strings
 * to avoid typos and enable auto-complete.
 *
 * @example
 * import { CELL_INPUT_RENDERERS } from "@/_components/stepper-form/helpers/constants/cellInputRenderers";
 * const field: FormFieldDef<MyRow> = { field: "name", inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT };
 */
export const CELL_INPUT_RENDERERS = {
  TEXT_INPUT: "textInput",
  TEXTAREA_INPUT: "textareaInput",
  NUMBER_INPUT: "numberInput",
  EMAIL_INPUT: "emailInput",
  DATE_INPUT: "dateInput",
  DROPDOWN_INPUT: "dropdownInput",
  CHECKBOX_INPUT: "checkboxInput",
  RADIO_INPUT: "radioInput",
  SWITCH_INPUT: "switchInput",
} as const;

/** Union of all supported cell-input renderer string values. */
export type CellInputRenderer =
  (typeof CELL_INPUT_RENDERERS)[keyof typeof CELL_INPUT_RENDERERS];
