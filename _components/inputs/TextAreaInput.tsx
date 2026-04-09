"use client";

import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

/**
 * Props for the {@link TextAreaInput} component.
 *
 * Extends MUI `TextFieldProps` with sensible multiline defaults.
 */
export interface TextAreaInputProps extends Omit<TextFieldProps, "variant"> {
  /** MUI variant applied to the field. @default "outlined" */
  variant?: TextFieldProps["variant"];
}

/**
 * TextAreaInput
 *
 * A multiline text area built on MUI `TextField` with `multiline` enabled.
 *
 * Use for longer free-text content such as descriptions or notes.
 * Works in both **form layouts** and **grid inline-edit** contexts.
 *
 * @example
 * ```tsx
 * // Form usage
 * <TextAreaInput label="Description" value={desc} onChange={handleChange} rows={4} />
 *
 * // Grid inline-edit
 * <TextAreaInput size="small" minRows={1} maxRows={3} value={notes} onChange={handleChange} />
 * ```
 */
const TextAreaInput = ({
  variant = "outlined",
  size = "small",
  fullWidth = true,
  minRows = 3,
  ...rest
}: TextAreaInputProps) => {
  return (
    <TextField
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      multiline
      minRows={minRows}
      {...rest}
    />
  );
};

export default TextAreaInput;
