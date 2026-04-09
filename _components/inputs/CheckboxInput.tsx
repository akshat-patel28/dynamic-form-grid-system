"use client";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import type { CheckboxProps } from "@mui/material/Checkbox";
import type { FormControlLabelProps } from "@mui/material/FormControlLabel";

/**
 * Props for the {@link CheckboxInput} component.
 *
 * Extends MUI `CheckboxProps` so every native Checkbox prop is available.
 */
export interface CheckboxInputProps extends CheckboxProps {
  /** Label displayed next to the checkbox. When omitted the checkbox renders standalone. */
  label?: FormControlLabelProps["label"];
  /** Helper / error text rendered below the checkbox. */
  helperText?: string;
  /** When `true`, helper text is styled as an error. */
  error?: boolean;
  /** Extra class applied to the outer wrapper. */
  wrapperClassName?: string;
}

/**
 * CheckboxInput
 *
 * A checkbox field built on MUI `Checkbox` with optional label and helper text.
 *
 * Works in both **form layouts** (with label + helper text) and
 * **grid inline-edit** (standalone, no label) scenarios.
 *
 * @example
 * ```tsx
 * // Form usage
 * <CheckboxInput label="Accept terms" checked={agreed} onChange={handleChange} />
 *
 * // Grid inline-edit (standalone)
 * <CheckboxInput checked={active} onChange={handleToggle} size="small" />
 * ```
 */
const CheckboxInput = ({
  label,
  helperText,
  error,
  wrapperClassName,
  className,
  ...rest
}: CheckboxInputProps) => {
  const checkbox = <Checkbox className={className} {...rest} />;

  if (!label && !helperText) return checkbox;

  return (
    <FormControl error={error} className={wrapperClassName}>
      {label ? (
        <FormControlLabel control={checkbox} label={label} />
      ) : (
        checkbox
      )}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default CheckboxInput;
