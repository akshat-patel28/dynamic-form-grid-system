/**
 * @fileoverview Public barrel for MUI-based form inputs used across the app.
 *
 * **Exports**
 * - Components: {@link TextInput}, {@link TextAreaInput}, {@link DropdownInput},
 *   {@link CheckboxInput}, {@link RadioInput}, {@link SwitchInput}
 * - Types: matching `*Props` interfaces plus {@link DropdownOption} and {@link RadioOption}
 *
 * **Why a barrel**
 * Consumers import from `@/_components/inputs` only. File paths under this folder
 * can change without updating every import site.
 *
 * **Stack**
 * All components are `"use client"` wrappers around Material UI. They accept the
 * corresponding MUI prop surfaces (with small opinionated defaults such as
 * `size="small"` and `fullWidth` where applicable).
 *
 * @see {@link https://mui.com/material-ui/} MUI component documentation
 *
 * @example
 * ```tsx
 * import { TextInput, DropdownInput } from "@/_components/inputs";
 * import type { TextInputProps, DropdownOption } from "@/_components/inputs";
 * ```
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

