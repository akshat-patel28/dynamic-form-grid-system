/**
 * @fileoverview Formik-based form that supports two modes via the `hideStepper` prop:
 *
 * - **Stepper (default):** Multi-row editor -- one visible row at a time with pagination,
 *   row header, and jump-to controls provided by `StepperPagination`.
 * - **Simple form (`hideStepper={true}`):** Single-page form with no stepper UI. Only the
 *   field grid and a standalone submit button are rendered.
 *
 * **Pieces**
 * - `StepperFormInner`: Formik, `activeStep`, and a ref-based map of each row's
 *   latest values (`rowStoreRef`).
 * - `StepperFormFields`: Renders inputs for the active row from `fieldDefs`.
 * - `StepperPagination`: First/prev/next/last, jump-to-row, and submit button
 *   (only rendered when `hideStepper` is `false`).
 *
 * **Why a ref store:** Formik holds only the current row's shape. On step change,
 * current values are written to `rowStoreRef`, the next row is loaded with
 * `setValues`, and `setTouched({})` clears stale errors from the previous row.
 *
 * **Remount rule:** The exported `StepperForm` wraps the inner implementation with
 * `key={props.rowData.length}`. When the **number of rows** changes, React remounts
 * the inner tree so the store and `activeStep` reset without an effect-driven state sync.
 * (Replacing `rowData` with the same length does not remount via this key alone.)
 *
 * @example Stepper mode (default)
 * ```tsx
 * <StepperForm
 *   fieldDefs={PERSON_FIELDS}
 *   rowData={people}
 *   validationSchema={personSchema}
 *   onSubmit={(allRows) => savePeople(allRows)}
 * />
 * ```
 *
 * @example Simple single-page form
 * ```tsx
 * <StepperForm
 *   hideStepper
 *   fieldDefs={PERSON_FIELDS}
 *   rowData={[person]}
 *   validationSchema={personSchema}
 *   submitLabel="Save"
 *   onSubmit={(values) => savePerson(values[0])}
 * />
 * ```
 */

"use client";

import { useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Formik, type FormikHelpers } from "formik";

import StepperFormFields from "./stepper-form-fields/StepperFormFields";
import StepperPagination from "./stepper-pagination/StepperPagination";
import type { StepperFormProps } from "./helpers/types/types";

/**
 * Stateful implementation: Formik + row index + persisted edits per row index.
 *
 * @remarks
 * **Navigation (stepper mode only):** `handleStepChange` persists `formik.values` to
 * `rowStoreRef` at the current `activeStep`, applies the target row from the store
 * (or `rowData` fallback), clears touched fields, then updates `activeStep`.
 *
 * **Simple form mode:** When `hideStepper` is `true`, the stepper header and
 * `StepperPagination` are not rendered. A standalone submit button appears below the
 * field grid instead.
 *
 * **Submit:** `handleFormikSubmit` writes the active row to the store, builds
 * `allRows` by merging store + original `rowData`, and invokes optional `onSubmit`.
 *
 * @template TData - Per-row record shape; must be compatible with `fieldDefs` keys.
 *
 * @param props - {@link StepperFormProps}
 * @returns Form element containing `StepperFormFields` and, depending on `hideStepper`,
 *   either stepper navigation or a standalone submit button.
 */
const StepperFormInner = <
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  fieldDefs,
  rowData,
  validationSchema,
  onSubmit,
  hideStepper = false,
  submitLabel = "Submit",
}: StepperFormProps<TData>) => {
  /**
   * Index of the row currently shown (0 .. `rowData.length - 1`).
   * Drives which slice of `rowStoreRef` is loaded into Formik.
   */
  const [activeStep, setActiveStep] = useState(0);

  /**
   * Mutable map: row index -> last known form values for that row.
   * Seeded on mount from `rowData`; updated on step change and on submit.
   */
  const rowStoreRef = useRef<Record<number, TData>>(
    Object.fromEntries(rowData.map((row, i) => [i, { ...row }])),
  );

  /**
   * Persists the active row, hydrates Formik with the target row, clears touched state.
   *
   * @param newStep - Zero-based destination index (clamped by `StepperPagination` before call).
   * @param currentValues - Snapshot from `formik.values` at navigation time.
   * @param helpers - Formik helpers for `setValues` / `setTouched`.
   *
   * @remarks
   * Memoized with `useCallback` because it is passed into `StepperPagination` and depends
   * on `activeStep` and `rowData`.
   */
  const handleStepChange = useCallback(
    (newStep: number, currentValues: TData, helpers: FormikHelpers<TData>) => {
      rowStoreRef.current[activeStep] = currentValues;

      const nextRow = rowStoreRef.current[newStep] ?? rowData[newStep];
      helpers.setValues(nextRow);
      helpers.setTouched({});
      setActiveStep(newStep);
    },
    [activeStep, rowData],
  );

  /**
   * Formik submit: merge active row into store, optionally notify parent with full list.
   *
   * @param values - Submitted values for the row that was active when submit fired.
   * @param helpers - Used to call `setSubmitting(false)` after optional `onSubmit`.
   */
  const handleFormikSubmit = (values: TData, helpers: FormikHelpers<TData>) => {
    rowStoreRef.current[activeStep] = values;

    if (onSubmit) {
      const allRows = rowData.map(
        (_, i) => rowStoreRef.current[i] ?? rowData[i],
      );
      onSubmit(allRows);
    }

    helpers.setSubmitting(false);
  };

  return (
    <Formik<TData>
      initialValues={{ ...rowData[0] }}
      validationSchema={validationSchema}
      onSubmit={handleFormikSubmit}
      enableReinitialize={false}
    >
      {(formik) => (
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          {!hideStepper && (
            <>
              {/* Step header */}
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Editing row {activeStep + 1} of {rowData.length}
              </Typography>

              {/* Row-level stepper navigation */}
              <StepperPagination
                activeStep={activeStep}
                totalSteps={rowData.length}
                onStepChange={(newStep) =>
                  handleStepChange(newStep, formik.values, formik)
                }
                disabled={!formik.isValid || formik.isSubmitting}
                submitLabel={submitLabel}
              />
            </>
          )}

          {/* Active row fields */}
          <StepperFormFields<TData>
            fieldDefs={fieldDefs}
            rowData={rowStoreRef.current[activeStep] ?? rowData[activeStep]}
          />

          {hideStepper && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!formik.isValid || formik.isSubmitting}
                sx={{ "&.Mui-disabled": { cursor: "not-allowed" } }}
              >
                {submitLabel}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Formik>
  );
};

/**
 * Public API: empty guard + `key` on inner form so row **count** changes reset state.
 *
 * @remarks
 * **Empty `rowData`:** Renders a short "No data available." message (no Formik).
 *
 * **Reset behavior:** `key={props.rowData.length}` remounts `StepperFormInner` when the
 * array length changes. Same length with different row identities does not reset via this key.
 *
 * **`hideStepper` mode:** When `true`, stepper navigation is hidden and a standalone submit
 * button is rendered below the fields. Pass a single-element `rowData` array for a plain
 * form experience. See {@link StepperFormProps.hideStepper}.
 *
 * @template TData - Row object type aligned with `fieldDefs` and `validationSchema`.
 *
 * @param props - {@link StepperFormProps}
 * @returns Stepper UI, simple form, or empty placeholder.
 */
const StepperForm = <
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  props: StepperFormProps<TData>,
) => {
  if (props.rowData.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No data available.
      </Typography>
    );
  }

  return <StepperFormInner key={props.rowData.length} {...props} />;
};

export default StepperForm;
