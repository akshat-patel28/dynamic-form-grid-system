/**
 * @fileoverview Maps `CellInputRenderer` identifiers to dynamically imported
 * input components from `@/_components/inputs`.
 *
 * Each component is wrapped with `next/dynamic` so its code is only
 * downloaded when it is actually rendered — unused input types add zero
 * bytes to the initial bundle.
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
 * Resolved entry returned by {@link resolveRenderer}.
 *
 * `Component` is the lazily-loaded React component and `group` classifies
 * the renderer so the caller can build the right prop bag.
 */
export interface RendererEntry {
  Component: ElementType;
  group:
    | "text"
    | "textarea"
    | "dropdown"
    | "checkbox"
    | "radio"
    | "switch";
  htmlInputType?: string;
}

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

const DEFAULT_ENTRY: RendererEntry =
  RENDERER_MAP[CELL_INPUT_RENDERERS.TEXT_INPUT];

/**
 * Returns the dynamically-imported component and metadata for a given
 * renderer identifier. Falls back to {@link DynamicTextInput} when
 * `renderer` is `undefined` or unrecognised.
 */
export function resolveRenderer(
  renderer: CellInputRenderer | undefined,
): RendererEntry {
  if (!renderer) return DEFAULT_ENTRY;
  return RENDERER_MAP[renderer] ?? DEFAULT_ENTRY;
}
