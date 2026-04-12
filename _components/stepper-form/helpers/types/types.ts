/**
 * @fileoverview Public TypeScript types for the StepperForm component library.
 *
 * Import these types on any page or feature file when defining a field schema
 * or passing props to `<StepperForm />`.
 *
 * @example
 * import type { FormFieldDef, StepperFormProps } from '@/_components/stepper-form';
 */

import type { CellInputRenderer } from "@/_components/grid/helpers/constants/cellInputRenderers";
import type { ObjectSchema } from "yup";

/**
 * Defines the configuration for a single form field in the stepper form.
 *
 * Shares ~80% of its DNA with the grid's `ColumnDef`:
 * - `field` maps to `ColumnDef.field`
 * - `label` maps to `ColumnDef.headerName`
 * - `editable` maps to `ColumnDef.editable`
 * - `inputRenderer` maps to `ColumnDef.cellInputRenderer`
 *
 * Grid-only concerns (`cellClass`, column sizing, `checkboxSelection`,
 * `valueFormatter`) are intentionally omitted. Validation is handled
 * entirely by a Yup schema passed to `<StepperForm />`.
 *
 * @template TData Shape of a single row data object. Defaults to
 *   `Record<string, unknown>` when not specified.
 *
 * @example
 * const fields: FormFieldDef<Person>[] = [
 *   { field: 'name',   label: 'Full Name', inputRenderer: 'textInput' },
 *   { field: 'age',    label: 'Age',       inputRenderer: 'numberInput' },
 *   { field: 'email',  label: 'Email',     inputRenderer: 'emailInput', placeholder: 'you@example.com' },
 * ];
 */
export interface FormFieldDef<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * The key used to read/write the field value from/to each row data object.
   * Must match a property name on the row data type.
   */
  field: string & keyof TData;

  /**
   * Human-readable label displayed above or beside the input.
   * Falls back to `field` when omitted.
   */
  label?: string;

  /**
   * Placeholder text shown inside the input when the value is empty.
   */
  placeholder?: string;

  /**
   * Controls whether the field is interactive or read-only (disabled).
   *
   * - `true` (default when omitted) — the field is editable.
   * - `false` — the field renders as disabled.
   * - `(params) => boolean` — evaluated per row so the same field definition
   *   can be conditionally editable depending on the row data.
   */
  editable?: boolean | ((params: { rowData: TData }) => boolean);

  /**
   * Determines which input component to render for this field.
   * Uses the same `CellInputRenderer` union as the grid's `ColumnDef`.
   *
   * When omitted, defaults to `"textInput"`.
   */
  inputRenderer?: CellInputRenderer;

  /**
   * Selectable options for `"dropdownInput"` and `"radioInput"` renderers.
   * Ignored for all other renderer types.
   */
  options?: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
}

/**
 * Props accepted by the `<StepperForm />` component.
 *
 * @template TData Shape of a single row data object. Defaults to
 *   `Record<string, unknown>` when not specified.
 *
 * @example
 * <StepperForm
 *   fieldDefs={PERSON_FIELDS}
 *   rowData={people}
 *   validationSchema={personSchema}
 *   onSubmit={(allRows) => console.log(allRows)}
 * />
 */
export interface StepperFormProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Field definitions that describe which inputs to render for each row.
   * Rendered top-to-bottom (or in a responsive grid) in the order provided.
   */
  fieldDefs: FormFieldDef<TData>[];

  /**
   * Array of row data objects. Each element becomes one "step" in the stepper.
   * The stepper renders the form for exactly one row at a time.
   */
  rowData: TData[];

  /**
   * Optional Yup object schema used to validate each row's data.
   * Passed directly to Formik's `validationSchema` prop.
   * All validation rules (required, min, max, pattern, etc.) belong here.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema?: ObjectSchema<any>;

  /**
   * Called when the user explicitly submits from the last step (or a
   * submit-all action). Receives the complete array of all rows with
   * any edits applied.
   */
  onSubmit?: (values: TData[]) => void;
}

/**
 * Props accepted by the `<StepperFormFields />` sub-component.
 *
 * @template TData Shape of a single row data object.
 */
export interface StepperFormFieldsProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Field definitions to render. */
  fieldDefs: FormFieldDef<TData>[];

  /** The full row data for the active step (used by `editable` callbacks). */
  rowData: TData;
}

/**
 * Props accepted by the `<StepperPagination />` sub-component.
 */
export interface StepperPaginationProps {
  /** Zero-based index of the currently active step. */
  activeStep: number;

  /** Total number of steps (rows). */
  totalSteps: number;

  /**
   * Called when the user requests navigation to a different step.
   *
   * @param newStep - Zero-based index of the target step.
   */
  onStepChange: (newStep: number) => void;

  /**
   * When `true`, all navigation controls (buttons and jump input) are
   * disabled. Typically driven by form-level validation state so that
   * the user must fix errors before navigating away.
   */
  disabled?: boolean;

  /**
   * Label for the form submit button (`type="submit"`). Renders beside the
   * stepper controls and triggers the wrapping form’s submit handler.
   *
   * @defaultValue `"Submit"`
   */
  submitLabel?: string;
}
