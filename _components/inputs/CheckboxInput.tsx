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
 * @remarks
 * Extends MUI `Checkbox` props (`checked`, `onChange`, `name`, `inputProps`, etc.).
 * `className` applies to the `Checkbox` itself; use `wrapperClassName` for the
 * optional `FormControl` wrapper when label or helper text is present.
 */
export interface CheckboxInputProps extends CheckboxProps {
  /**
   * Optional label; when set, wraps the checkbox in `FormControlLabel`.
   * When both `label` and `helperText` are omitted, returns the raw `Checkbox` only
   * (useful for tight table cells).
   */
  label?: FormControlLabelProps["label"];
  /** Rendered under the control inside `FormHelperText` when `FormControl` is used. */
  helperText?: string;
  /** Sets `FormControl` `error` so helper text uses the error color. */
  error?: boolean;
  /** Applied to the outer `FormControl` when label or helper text requires a wrapper. */
  wrapperClassName?: string;
}

/**
 * Checkbox with optional label and helper text, backed by MUI `Checkbox`.
 *
 * @remarks
 * **Rendering branches:** No label and no helper → plain `Checkbox`. Otherwise →
 * `FormControl` containing `FormControlLabel` and optional `FormHelperText`.
 *
 * **Form libraries:** With Formik, use `checked` + `onChange` (or `field` spread)
 * consistent with MUI’s controlled checkbox pattern.
 *
 * @param props - {@link CheckboxInputProps}
 * @returns `Checkbox`, or `FormControl` wrapping label + checkbox + helper.
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
