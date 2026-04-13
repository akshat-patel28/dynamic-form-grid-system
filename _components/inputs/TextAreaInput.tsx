"use client";

import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

/**
 * Props for the {@link TextAreaInput} component.
 *
 * @remarks
 * Same surface as MUI `TextField` (minus re-declared `variant`). The component always
 * sets `multiline` and a default `minRows`; you can still pass `rows`, `maxRows`,
 * `minRows`, or `slotProps` to tune height and resize behavior per MUI docs.
 */
export interface TextAreaInputProps extends Omit<TextFieldProps, "variant"> {
  /**
   * MUI TextField visual variant.
   * @defaultValue `"outlined"`
   */
  variant?: TextFieldProps["variant"];
}

/**
 * Multiline text area built on MUI `TextField` with `multiline` forced on.
 *
 * @remarks
 * **Defaults:** `variant="outlined"`, `size="small"`, `fullWidth={true}`, `minRows={3}`.
 * Pass explicit `rows` / `maxRows` / `minRows` to override vertical sizing.
 *
 * **Use cases:** Descriptions, notes, comments — anywhere a single line is insufficient.
 *
 * @param props - {@link TextAreaInputProps}
 * @returns A MUI `TextField` configured as a textarea.
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
