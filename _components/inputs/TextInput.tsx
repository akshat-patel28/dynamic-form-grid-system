"use client";

import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

/**
 * Props for the {@link TextInput} component.
 *
 * Extends MUI `TextFieldProps` so every native TextField prop is available.
 * The `type` prop defaults to `"text"` but can be set to `"number"` to
 * render a numeric input — both variants share the same component.
 */
export interface TextInputProps extends Omit<TextFieldProps, "variant"> {
  /** MUI variant applied to the field. @default "outlined" */
  variant?: TextFieldProps["variant"];
}

/**
 * TextInput
 *
 * A unified text / number input built on MUI `TextField`.
 * Pass `type="number"` for numeric entry; defaults to plain text.
 *
 * Designed to work in both **form layouts** (full-width with labels) and
 * **grid inline-edit** (compact, no label) scenarios.
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
    <TextField
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      {...rest}
    />
  );
};

export default TextInput;
