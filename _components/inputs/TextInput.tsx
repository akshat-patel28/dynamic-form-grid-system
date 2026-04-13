"use client";

import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

/**
 * Props for the {@link TextInput} component.
 *
 * @remarks
 * Extends MUI {@link https://mui.com/material-ui/api/text-field/ TextField} props
 * (except `variant`, which is re-declared below for documentation). You may pass any
 * `TextField` prop: `label`, `value`, `onChange`, `error`, `helperText`, `InputProps`,
 * `inputProps`, `slotProps`, etc.
 *
 * Use {@link TextAreaInput} for multiline content; this component is intended for
 * single-line (or numeric/date when `type` is set) entry.
 */
export interface TextInputProps extends Omit<TextFieldProps, "variant"> {
  /**
   * MUI TextField visual variant (`outlined`, `filled`, `standard`).
   * @defaultValue `"outlined"`
   */
  variant?: TextFieldProps["variant"];
}

/**
 * Single-line text (and related HTML types) input backed by MUI `TextField`.
 *
 * @remarks
 * **Defaults:** `variant="outlined"`, `size="small"`, `fullWidth={true}` — suitable
 * for dense forms and data grids. Override when embedding in tight layouts.
 *
 * **Numeric and specialized types:** Set `type="number"`, `"email"`, `"date"`, etc.
 * Validation is still the caller’s responsibility (e.g. Yup, native `min`/`max`).
 *
 * **Controlled usage:** Typical pattern is `value` + `onChange` from React state or Formik.
 *
 * @param props - {@link TextInputProps}
 * @returns A MUI `TextField` element.
 *
 * @example
 * ```tsx
 * // Form usage
 * <TextInput label="Full Name" value={name} onChange={handleChange} />
 *
 * // Grid inline-edit (compact)
 * <TextInput
 *   type="number"
 *   size="small"
 *   value={price}
 *   onChange={handleChange}
 *   className="grid-cell-input"
 * />
 * ```
 */
const TextInput = ({
  variant = "outlined",
  size = "small",
  fullWidth = true,
  ...rest
}: TextInputProps) => {
  return (
    <TextField variant={variant} size={size} fullWidth={fullWidth} {...rest} />
  );
};

export default TextInput;
