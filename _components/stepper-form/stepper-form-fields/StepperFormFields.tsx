/**
 * @fileoverview Renders the form fields for a single active row (step)
 * in the stepper form.
 *
 * Each `FormFieldDef` in the `fieldDefs` array produces the input component
 * that matches its `inputRenderer` value. Components are loaded lazily via
 * `next/dynamic` so only the renderers actually used on a page are
 * included in the client bundle.
 *
 * Only the active row's fields are mounted — inactive rows have no DOM.
 *
 * @example
 * <StepperFormFields fieldDefs={PERSON_FIELDS} rowData={currentRow} />
 */

"use client";

import Box from "@mui/material/Box";
import { useFormikContext } from "formik";

import type { StepperFormFieldsProps } from "../helpers/types/types";
import { resolveRenderer } from "../helpers/utils/fieldRendererMap";

/**
 * Resolves whether a field is editable for the current row.
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
 * Builds the props object for a resolved renderer entry.
 *
 * Each `group` has a slightly different prop shape (e.g. checkbox/switch
 * use `checked` instead of `value`, date pickers need `setFieldValue`).
 */
function buildFieldProps(
  group: string,
  fieldKey: string,
  label: string,
  value: unknown,
  disabled: boolean,
  hasError: boolean,
  errorText: string | undefined,
  placeholder: string | undefined,
  htmlInputType: string | undefined,
  def: { options?: Array<{ value: string | number; label: string; disabled?: boolean }> },
  handlers: {
    handleChange: (e: React.ChangeEvent<unknown>) => void;
    handleBlur: (e: React.FocusEvent<unknown>) => void;
    setFieldValue: (field: string, val: unknown) => void;
  },
): Record<string, unknown> {
  const base = {
    name: fieldKey,
    label,
    disabled,
    error: hasError,
    helperText: errorText,
  };

  switch (group) {
    case "text":
      return {
        ...base,
        type: htmlInputType,
        placeholder,
        value: value ?? "",
        onChange: handlers.handleChange,
        onBlur: handlers.handleBlur,
        size: "small",
        fullWidth: true,
        ...(htmlInputType === "date" && {
          slotProps: { inputLabel: { shrink: true } },
        }),
      };

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
 * StepperFormFields
 *
 * Renders a responsive grid of input components for the active stepper row.
 * Each field is driven by a `FormFieldDef` and connected to Formik's state
 * via `useFormikContext`. The concrete input component is resolved lazily
 * through {@link resolveRenderer}.
 *
 * **Layout:** Two-column CSS grid on screens wider than 600 px, single
 * column on smaller screens.
 *
 * @template TData Shape of a single row data object.
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

        const fieldProps = buildFieldProps(
          group,
          fieldKey,
          label,
          values[fieldKey],
          !isEditable,
          hasError,
          errorText,
          def.placeholder,
          htmlInputType,
          def,
          handlers,
        );

        return <Component key={fieldKey} {...fieldProps} />;
      })}
    </Box>
  );
};

export default StepperFormFields;
