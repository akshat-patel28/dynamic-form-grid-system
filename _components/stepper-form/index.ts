/**
 * @fileoverview Public entry point for the StepperForm component library.
 *
 * Import the component and its types from this single path so that internal
 * file locations remain an implementation detail.
 *
 * @example
 * import StepperForm from '@/_components/stepper-form';
 * import type { FormFieldDef, StepperFormProps } from '@/_components/stepper-form';
 */

export { default } from "./StepperForm";

export type {
  FormFieldDef,
  StepperFormProps,
  StepperFormFieldsProps,
  StepperPaginationProps,
} from "./helpers/types/types";
