/**
 * @fileoverview Barrel for the stepper-style multi-row form (Formik + lazy inputs).
 *
 * **Default export:** `StepperForm` — main container.
 * **Types:** `FormFieldDef`, `StepperFormProps`, `StepperFormFieldsProps`, `StepperPaginationProps`,
 * plus `BuildFieldPropsParams` / `BuildFieldPropsHandlers` / `BuildFieldPropsFieldDefSlice` for field wiring.
 *
 * **Related modules:** Field rendering uses the `resolveRenderer` helper in
 * `helpers/utils/fieldRendererMap` (not re-exported here). Dataset-level paging is
 * separate; use `@/_components/pagination` for API page controls.
 *
 * @example
 * ```tsx
 * import StepperForm from "@/_components/stepper-form";
 * import type { FormFieldDef, StepperFormProps } from "@/_components/stepper-form";
 * ```
 */

export { default } from "./StepperForm";

export type {
  BuildFieldPropsFieldDefSlice,
  BuildFieldPropsHandlers,
  BuildFieldPropsParams,
  FormFieldDef,
  StepperFormProps,
  StepperFormFieldsProps,
  StepperPaginationProps,
} from "./helpers/types/types";
