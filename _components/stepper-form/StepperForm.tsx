/**
 * @fileoverview Main StepperForm component.
 *
 * Combines Formik for state management, `StepperFormFields` for rendering
 * the active row's inputs, and `StepperPagination` for navigating between
 * rows.
 *
 * **Core design:** Only the active row is rendered. A `useRef`-based
 * normalised store persists every row's values across step changes so
 * that Formik only ever manages a single flat object (the current row).
 *
 * When the parent provides a new `rowData` array (e.g. after an API
 * page change), the outer `StepperForm` wrapper supplies a fresh
 * `key` which remounts the inner component, resetting the store and
 * active step cleanly without `useEffect` + `setState`.
 *
 * @example
 * <StepperForm
 *   fieldDefs={PERSON_FIELDS}
 *   rowData={people}
 *   validationSchema={personSchema}
 *   onSubmit={(allRows) => savePeople(allRows)}
 * />
 */

"use client";

import { useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Formik, type FormikHelpers } from "formik";

import StepperFormFields from "./stepper-form-fields/StepperFormFields";
import StepperPagination from "./stepper-pagination/StepperPagination";
import type { StepperFormProps } from "./helpers/types/types";

/**
 * StepperFormInner
 *
 * Contains all the stateful logic (Formik, activeStep, rowStore).
 * Mounted fresh every time `rowData` identity changes via the `key`
 * applied by the outer `StepperForm` wrapper.
 *
 * @template TData Shape of a single row data object.
 *
 * @param props - {@link StepperFormProps}
 * @returns The rendered stepper form.
 */
const StepperFormInner = <
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  fieldDefs,
  rowData,
  validationSchema,
  onSubmit,
}: StepperFormProps<TData>) => {
  /** Zero-based index of the currently visible row / step. */
  const [activeStep, setActiveStep] = useState(0);

  /**
   * Normalised store holding every row's latest values.
   * Keyed by row index. Initialised from `rowData` on mount.
   */
  const rowStoreRef = useRef<Record<number, TData>>(
    Object.fromEntries(rowData.map((row, i) => [i, { ...row }])),
  );

  /**
   * Handles step navigation.
   *
   * 1. Persists current Formik values into the store.
   * 2. Loads the target row into Formik.
   * 3. Resets touched state so errors from the previous row do not bleed.
   *
   * Wrapped in `useCallback` because it closes over `activeStep` and is
   * passed as a prop to `<StepperPagination />`.
   */
  const handleStepChange = useCallback(
    (
      newStep: number,
      currentValues: TData,
      helpers: FormikHelpers<TData>,
    ) => {
      rowStoreRef.current[activeStep] = currentValues;

      const nextRow = rowStoreRef.current[newStep] ?? rowData[newStep];
      helpers.setValues(nextRow);
      helpers.setTouched({});
      setActiveStep(newStep);
    },
    [activeStep, rowData],
  );

  /**
   * Formik `onSubmit` handler.
   *
   * Saves the current row into the store, then calls the consumer's
   * `onSubmit` with the complete row array (all edits applied).
   *
   * @param values  - Current row's Formik values.
   * @param helpers - Formik helpers for post-submit actions.
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
            disabled={!formik.isValid}
          />

          {/* Active row fields */}
          <StepperFormFields<TData>
            fieldDefs={fieldDefs}
            rowData={
              rowStoreRef.current[activeStep] ?? rowData[activeStep]
            }
          />
        </Box>
      )}
    </Formik>
  );
};

/**
 * StepperForm
 *
 * Public wrapper that forces a full remount of `StepperFormInner` whenever
 * the `rowData` reference changes (e.g. after an API page change).
 * This avoids `useEffect` + `setState` cascading-render patterns by
 * using React's `key` mechanism to reset all internal state cleanly.
 *
 * @template TData Shape of a single row data object.
 *
 * @param props - {@link StepperFormProps}
 * @returns The stepper form, or an empty-state message when `rowData` is empty.
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
