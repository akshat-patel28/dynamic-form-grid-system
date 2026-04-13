/**
 * @fileoverview Shared TypeScript contracts for the stepper form feature.
 *
 * Use these types when:
 * - Declaring a `fieldDefs` array (`FormFieldDef<T>`).
 * - Wrapping `StepperForm` in a parent that owns `rowData` (`StepperFormProps<T>`).
 * - Building alternate layouts that reuse the same field grid or pager props.
 *
 * @example
 * ```ts
 * import type { FormFieldDef, StepperFormProps } from "@/_components/stepper-form";
 * ```
 */

import type { CellInputRenderer } from "@/_components/grid/helpers/constants/cellInputRenderers";
import type { ObjectSchema } from "yup";

/**
 * Declares one input column in the stepper’s vertical (or two-column) field layout.
 *
 * @remarks
 * **Alignment with the data grid:** Mirrors `ColumnDef` where it makes sense:
 * | Stepper (`FormFieldDef`) | Grid (`ColumnDef`) |
 * |--------------------------|-------------------|
 * | `field` | `field` |
 * | `label` | `headerName` |
 * | `editable` | `editable` |
 * | `inputRenderer` | `cellInputRenderer` |
 *
 * Grid-only behavior (width, `cellClassName`, selection, formatters) is omitted.
 * **Validation** is not per-field here — supply a Yup `ObjectSchema` on `StepperForm`.
 *
 * **Render pipeline:** `inputRenderer` is resolved through `resolveRenderer` in
 * `fieldRendererMap.ts`, which lazy-loads the matching component from `@/_components/inputs`.
 *
 * @template TData - Row record type; `field` is constrained to keys of `TData`.
 *
 * @example
 * ```ts
 * const fields: FormFieldDef<Person>[] = [
 *   { field: "name", label: "Full Name", inputRenderer: "textInput" },
 *   { field: "age", label: "Age", inputRenderer: "numberInput" },
 *   {
 *     field: "email",
 *     label: "Email",
 *     inputRenderer: "emailInput",
 *     placeholder: "you@example.com",
 *   },
 * ];
 * ```
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
   * Options list for `dropdownInput` and `radioInput` renderers only.
   * Passed through to the dropdown and radio input components as their `options` prop.
   */
  options?: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
}

/**
 * Top-level props for the default-export stepper form.
 *
 * @remarks
 * **Formik:** `rowData[0]` seeds `initialValues`. `enableReinitialize` stays `false` so
 * navigation does not wipe in-progress edits; the ref store owns cross-step state.
 *
 * **Submit:** The submit button lives in `StepperPagination` (`type="submit"`). `onSubmit`
 * receives **all rows** with edits merged from the store.
 *
 * @template TData - Same row type as each element of `rowData` and keys in `fieldDefs`.
 *
 * @example
 * ```tsx
 * <StepperForm
 *   fieldDefs={PERSON_FIELDS}
 *   rowData={people}
 *   validationSchema={personSchema}
 *   onSubmit={(allRows) => console.log(allRows)}
 * />
 * ```
 */
export interface StepperFormProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Ordered list of fields to render for **every** row; order matches visual order in the grid.
   */
  fieldDefs: FormFieldDef<TData>[];

  /**
   * One object per step. Length equals step count; only `rowData[activeStep]` is shown,
   * but edits for other indices are kept in the internal store until submit or remount.
   */
  rowData: TData[];

  /**
   * Optional Yup schema validating the flat row object shape (same keys as Formik values).
   * Wired to Formik as `validationSchema`; use for required fields, min/max, regex, etc.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema?: ObjectSchema<any>;

  /**
   * Fires when the form submits successfully (after the active row is flushed to the store).
   * Argument is the full `rowData` length array with user edits applied per index.
   */
  onSubmit?: (values: TData[]) => void;
}

/**
 * Props for the internal field grid used by `StepperForm` (not usually imported by pages).
 *
 * @template TData - Row type; `rowData` should be the active row’s snapshot for `editable` functions.
 */
export interface StepperFormFieldsProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Same schema as the parent `StepperForm`’s `fieldDefs`. */
  fieldDefs: FormFieldDef<TData>[];

  /**
   * Current row object from the parent (used when `editable` is a function of `rowData`).
   * Formik values still come from context — this prop is for per-row edit rules only.
   */
  rowData: TData;
}

/**
 * Props for the row navigation + submit strip above the field grid.
 */
export interface StepperPaginationProps {
  /**
   * Current step, **zero-based** (first row is `0`). UI shows one-based “Row N of M”.
   */
  activeStep: number;

  /** Same as `rowData.length` from the parent stepper. */
  totalSteps: number;

  /**
   * Invoked after the user moves via buttons or the jump field (already clamped to bounds).
   *
   * @param newStep - Zero-based destination index.
   */
  onStepChange: (newStep: number) => void;

  /**
   * When `true`, disables icon buttons, jump field, and submit. Parent typically sets this
   * from `!formik.isValid || formik.isSubmitting` so invalid rows cannot be skipped silently.
   *
   * @defaultValue `false`
   */
  disabled?: boolean;

  /**
   * Text on the `Button` with `type="submit"` (must stay inside the surrounding `<form>`).
   *
   * @defaultValue `"Submit"`
   */
  submitLabel?: string;
}
