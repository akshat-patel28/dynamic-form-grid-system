/**
 * @fileoverview Renders the form fields for a single active row (step)
 * in the stepper form.
 *
 * Each `FormFieldDef` in the `fieldDefs` array produces one MUI
 * `<TextField />`. The input `type` is resolved via `getInputType`
 * and the field is wired to Formik through `useFormikContext`.
 *
 * Only the active row's fields are mounted — inactive rows have no DOM.
 *
 * @example
 * <StepperFormFields fieldDefs={PERSON_FIELDS} rowData={currentRow} />
 */

"use client";

import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useFormikContext } from "formik";

import type { StepperFormFieldsProps } from "../helpers/types/types";
import {
  getInputType,
  isTextareaRenderer,
} from "../helpers/utils/fieldRendererMap";

/**
 * Resolves whether a field is editable for the current row.
 *
 * @param editable - The `editable` value from `FormFieldDef`.
 * @param rowData  - The current row data object.
 * @returns `true` if the field should be interactive, `false` if disabled.
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
 * StepperFormFields
 *
 * Renders a responsive grid of MUI `<TextField />` inputs for the active
 * stepper row. Each field is driven by a `FormFieldDef` and connected to
 * Formik's state via `useFormikContext`.
 *
 * **Layout:** Two-column CSS grid on screens wider than 600 px, single
 * column on smaller screens.
 *
 * @template TData Shape of a single row data object.
 *
 * @param props - {@link StepperFormFieldsProps}
 * @returns The rendered form fields for the active row.
 *
 * @example
 * <StepperFormFields
 *   fieldDefs={PERSON_FIELDS}
 *   rowData={people[activeStep]}
 * />
 */
const StepperFormFields = <
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  fieldDefs,
  rowData,
}: StepperFormFieldsProps<TData>) => {
  const { values, handleChange, handleBlur, errors, touched } =
    useFormikContext<Record<string, unknown>>();

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
        const inputType = getInputType(def.inputRenderer);
        const multiline = isTextareaRenderer(def.inputRenderer);
        const isEditable = resolveEditable(def.editable, rowData);
        const hasError =
          Boolean(touched[fieldKey]) && Boolean(errors[fieldKey]);
        const errorText =
          hasError && typeof errors[fieldKey] === "string"
            ? (errors[fieldKey] as string)
            : undefined;

        return (
          <TextField
            key={fieldKey}
            name={fieldKey}
            label={label}
            type={multiline ? undefined : inputType}
            placeholder={def.placeholder}
            disabled={!isEditable}
            value={values[fieldKey] ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={hasError}
            helperText={errorText}
            size="small"
            fullWidth
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
            sx={
              multiline
                ? { gridColumn: { xs: "1", sm: "1 / -1" } }
                : undefined
            }
            slotProps={
              inputType === "date"
                ? { inputLabel: { shrink: true } }
                : undefined
            }
          />
        );
      })}
    </Box>
  );
};

export default StepperFormFields;
