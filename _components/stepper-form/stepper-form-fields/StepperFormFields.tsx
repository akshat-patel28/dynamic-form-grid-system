/**
 * @fileoverview Maps `fieldDefs` + Formik context → lazily loaded input components.
 *
 * @remarks
 * **Single row:** Only the active step’s fields exist in the DOM; switching steps
 * unmounts the previous inputs.
 *
 * **Formik:** Reads `values`, `errors`, `touched`, and handlers from `useFormikContext`.
 * Each field’s `name` matches `def.field` for standard Formik change/blur events.
 *
 * **Layout:** CSS grid — one column on `xs`, two columns from `sm` up; textarea spans
 * full width on `sm+` via `sx`.
 *
 * @example
 * ```tsx
 * <StepperFormFields fieldDefs={PERSON_FIELDS} rowData={currentRow} />
 * ```
 */

"use client";

import Box from "@mui/material/Box";
import { useFormikContext } from "formik";

import type {
  BuildFieldPropsParams,
  StepperFormFieldsProps,
} from "../helpers/types/types";
import { resolveRenderer } from "../helpers/utils/fieldRendererMap";

/**
 * Computes read-only vs interactive state for one field definition.
 *
 * @param editable - `true` / `false`, or a predicate receiving the current `rowData`.
 * @param rowData - Row snapshot from the parent (same object passed as `StepperFormFields` prop).
 * @returns `false` when the field should render `disabled`; otherwise `true`.
 */
function resolveEditable<TData extends Record<string, unknown>>(
  editable: boolean | ((params: { rowData: TData }) => boolean) | undefined,
  rowData: TData,
): boolean {
  if (typeof editable === "function") return editable({ rowData });
  if (typeof editable === "boolean") return editable;
  return true;
}

/**
 * Translates a renderer `group` into the prop object expected by the MUI input wrapper.
 *
 * @param params - {@link BuildFieldPropsParams}
 * @returns Plain object spread onto the resolved dynamic component.
 *
 * @remarks
 * Checkbox and switch groups use `checked: Boolean(value)`; text-like groups coerce
 * `value` to `""` when nullish. Date inputs add `slotProps.inputLabel.shrink` for MUI.
 * `number` / `date` types forward `FormFieldDef.minValue` / `maxValue` to
 * `slotProps.htmlInput` as native `min` / `max`.
 */
function buildTextGroupSlotProps(
  htmlInputType: string | undefined,
  def: BuildFieldPropsParams["def"],
): Record<string, unknown> | undefined {
  const slotProps: Record<string, unknown> = {};

  if (htmlInputType === "date") {
    slotProps.inputLabel = { shrink: true };
  }

  const supportsMinMax =
    htmlInputType === "number" || htmlInputType === "date";
  const hasMin = def.minValue !== undefined;
  const hasMax = def.maxValue !== undefined;

  if (supportsMinMax && (hasMin || hasMax)) {
    slotProps.htmlInput = {
      ...(hasMin ? { min: def.minValue } : {}),
      ...(hasMax ? { max: def.maxValue } : {}),
    };
  }

  return Object.keys(slotProps).length > 0 ? slotProps : undefined;
}

function buildFieldProps({
  group,
  fieldKey,
  label,
  value,
  disabled,
  hasError,
  errorText,
  placeholder,
  htmlInputType,
  def,
  handlers,
}: BuildFieldPropsParams): Record<string, unknown> {
  const base = {
    name: fieldKey,
    label,
    disabled,
    error: hasError,
    helperText: errorText,
  };

  switch (group) {
    case "text": {
      const slotProps = buildTextGroupSlotProps(htmlInputType, def);
      return {
        ...base,
        type: htmlInputType,
        placeholder,
        value: value ?? "",
        onChange: handlers.handleChange,
        onBlur: handlers.handleBlur,
        size: "small",
        fullWidth: true,
        ...(slotProps ? { slotProps } : {}),
      };
    }

    case "textarea":
      return {
        ...base,
        placeholder,
        value: value ?? "",
        onChange: handlers.handleChange,
        onBlur: handlers.handleBlur,
        size: "small",
        fullWidth: true,
        sx: { gridColumn: { xs: "1", sm: "1 / -1" } },
      };

    case "dropdown":
      return {
        ...base,
        value: value ?? "",
        onChange: handlers.handleChange,
        onBlur: handlers.handleBlur,
        options: def.options ?? [],
        size: "small",
        fullWidth: true,
      };

    case "checkbox":
      return {
        ...base,
        checked: Boolean(value),
        onChange: handlers.handleChange,
      };

    case "switch":
      return {
        ...base,
        checked: Boolean(value),
        onChange: handlers.handleChange,
      };

    case "radio":
      return {
        ...base,
        value: value ?? "",
        onChange: handlers.handleChange,
        options: def.options ?? [],
      };

    default:
      return {
        ...base,
        value: value ?? "",
        onChange: handlers.handleChange,
        onBlur: handlers.handleBlur,
        size: "small",
        fullWidth: true,
      };
  }
}

/**
 * Responsive grid of fields for the active stepper row, bound to Formik.
 *
 * @template TData - Row record type shared with parent `StepperForm`.
 *
 * @param props.fieldDefs - Field schema (order = display order).
 * @param props.rowData - Row used for `editable` callbacks; mirrors active row from parent.
 * @returns A `Box` grid containing one dynamic input per definition.
 *
 * @remarks
 * Lazy components come from {@link resolveRenderer}; keys on children are the string `field` name.
 */
const StepperFormFields = <
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  fieldDefs,
  rowData,
}: StepperFormFieldsProps<TData>) => {
  const { values, handleChange, handleBlur, errors, touched, setFieldValue } =
    useFormikContext<Record<string, unknown>>();

  const handlers = { handleChange, handleBlur, setFieldValue };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      {fieldDefs.map((def) => {
        const fieldKey = def.field as string;
        const label = def.label ?? fieldKey;
        const isEditable = resolveEditable(def.editable, rowData);
        const hasError =
          Boolean(touched[fieldKey]) && Boolean(errors[fieldKey]);
        const errorText =
          hasError && typeof errors[fieldKey] === "string"
            ? (errors[fieldKey] as string)
            : undefined;

        const { Component, group, htmlInputType } = resolveRenderer(
          def.inputRenderer,
        );

        const fieldProps = buildFieldProps({
          group,
          fieldKey,
          label,
          value: values[fieldKey],
          disabled: !isEditable,
          hasError,
          errorText,
          placeholder: def.placeholder,
          htmlInputType,
          def,
          handlers,
        });

        return <Component key={fieldKey} {...fieldProps} />;
      })}
    </Box>
  );
};

export default StepperFormFields;
