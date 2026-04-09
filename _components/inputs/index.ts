/**
 * @fileoverview Public entry point for shared input components.
 *
 * Import any input component and its props type from this single path so that
 * internal file locations remain an implementation detail.
 *
 * @example
 * import { TextInput, DropdownInput } from "@/_components/inputs";
 * import type { TextInputProps, DropdownOption } from "@/_components/inputs";
 */

export { default as TextInput } from "./TextInput";
export type { TextInputProps } from "./TextInput";

export { default as TextAreaInput } from "./TextAreaInput";
export type { TextAreaInputProps } from "./TextAreaInput";

export { default as DropdownInput } from "./DropdownInput";
export type { DropdownInputProps, DropdownOption } from "./DropdownInput";

export { default as CheckboxInput } from "./CheckboxInput";
export type { CheckboxInputProps } from "./CheckboxInput";

export { default as RadioInput } from "./RadioInput";
export type { RadioInputProps, RadioOption } from "./RadioInput";

export { default as SwitchInput } from "./SwitchInput";
export type { SwitchInputProps } from "./SwitchInput";

export { default as DatePickerInput } from "./DatePickerInput";
export type { DatePickerInputProps } from "./DatePickerInput";
