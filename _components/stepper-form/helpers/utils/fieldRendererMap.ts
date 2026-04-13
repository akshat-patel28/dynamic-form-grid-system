/**
 * @fileoverview Bridge between grid `CellInputRenderer` keys and shared input widgets.
 *
 * @remarks
 * **Code splitting:** Every mapped component is loaded via `next/dynamic` from
 * `@/_components/inputs`, so a page that only uses text fields never downloads
 * radio/switch/dropdown chunks until those renderers appear in `fieldDefs`.
 *
 * **Consumers:** `StepperFormFields` calls {@link resolveRenderer} per field; the grid
 * may use the same constants from `cellInputRenderers.ts`.
 *
 * **Metadata:** {@link RendererEntry} carries a `group` string consumed by
 * `buildFieldProps` in `StepperFormFields.tsx` to shape Formik-friendly props
 * (`value` vs `checked`, `options`, `type`, etc.).
 */

import dynamic from "next/dynamic";
import type { ElementType } from "react";

import {
  CELL_INPUT_RENDERERS,
  type CellInputRenderer,
} from "@/_components/grid/helpers/constants/cellInputRenderers";

const DynamicTextInput = dynamic(
  () => import("@/_components/inputs/TextInput"),
);
const DynamicTextAreaInput = dynamic(
  () => import("@/_components/inputs/TextAreaInput"),
);
const DynamicDropdownInput = dynamic(
  () => import("@/_components/inputs/DropdownInput"),
);
const DynamicCheckboxInput = dynamic(
  () => import("@/_components/inputs/CheckboxInput"),
);
const DynamicRadioInput = dynamic(
  () => import("@/_components/inputs/RadioInput"),
);
const DynamicSwitchInput = dynamic(
  () => import("@/_components/inputs/SwitchInput"),
);

/**
 * Output of {@link resolveRenderer}: which React component to mount and how to wire it.
 */
export interface RendererEntry {
  /**
   * Lazy `next/dynamic` wrapper around a default export from `@/_components/inputs`.
   */
  Component: ElementType;
  /**
   * Discriminator for prop construction in `StepperFormFields.buildFieldProps`.
   * - `text` — `TextInput` with optional `type` from `htmlInputType`
   * - `textarea` — `TextAreaInput`
   * - `dropdown` — `DropdownInput` (+ `options`)
   * - `checkbox` / `switch` — boolean `checked` wiring
   * - `radio` — `RadioInput` (+ `options`)
   */
  group:
    | "text"
    | "textarea"
    | "dropdown"
    | "checkbox"
    | "radio"
    | "switch";
  /**
   * For `group === "text"`, forwarded as MUI `TextField` `type` (`text`, `number`, `email`, `date`, …).
   */
  htmlInputType?: string;
}

/**
 * Static lookup from each `CELL_INPUT_RENDERERS` constant to its lazy component + metadata.
 */
const RENDERER_MAP: Record<CellInputRenderer, RendererEntry> = {
  [CELL_INPUT_RENDERERS.TEXT_INPUT]: {
    Component: DynamicTextInput,
    group: "text",
    htmlInputType: "text",
  },
  [CELL_INPUT_RENDERERS.NUMBER_INPUT]: {
    Component: DynamicTextInput,
    group: "text",
    htmlInputType: "number",
  },
  [CELL_INPUT_RENDERERS.EMAIL_INPUT]: {
    Component: DynamicTextInput,
    group: "text",
    htmlInputType: "email",
  },
  [CELL_INPUT_RENDERERS.TEXTAREA_INPUT]: {
    Component: DynamicTextAreaInput,
    group: "textarea",
  },
  [CELL_INPUT_RENDERERS.DATE_INPUT]: {
    Component: DynamicTextInput,
    group: "text",
    htmlInputType: "date",
  },
  [CELL_INPUT_RENDERERS.DROPDOWN_INPUT]: {
    Component: DynamicDropdownInput,
    group: "dropdown",
  },
  [CELL_INPUT_RENDERERS.CHECKBOX_INPUT]: {
    Component: DynamicCheckboxInput,
    group: "checkbox",
  },
  [CELL_INPUT_RENDERERS.RADIO_INPUT]: {
    Component: DynamicRadioInput,
    group: "radio",
  },
  [CELL_INPUT_RENDERERS.SWITCH_INPUT]: {
    Component: DynamicSwitchInput,
    group: "switch",
  },
};

/**
 * Fallback when `renderer` is missing or unknown — plain text `TextInput`.
 */
const DEFAULT_ENTRY: RendererEntry =
  RENDERER_MAP[CELL_INPUT_RENDERERS.TEXT_INPUT];

/**
 * Looks up the lazy input component and wiring metadata for a renderer key.
 *
 * @param renderer - A `CellInputRenderer` value from field defs, or `undefined` to use the default.
 * @returns A {@link RendererEntry}; never throws — unknown keys map to `TEXT_INPUT`.
 */
export function resolveRenderer(
  renderer: CellInputRenderer | undefined,
): RendererEntry {
  if (!renderer) return DEFAULT_ENTRY;
  return RENDERER_MAP[renderer] ?? DEFAULT_ENTRY;
}
