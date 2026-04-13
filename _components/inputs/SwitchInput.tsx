"use client";

import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import type { SwitchProps } from "@mui/material/Switch";
import type { FormControlLabelProps } from "@mui/material/FormControlLabel";

/**
 * Props for the {@link SwitchInput} component.
 *
 * @remarks
 * Extends MUI `Switch` props. Same wrapper pattern as {@link CheckboxInput}: without
 * `label` and `helperText`, only the switch element is returned.
 */
export interface SwitchInputProps extends SwitchProps {
  /**
   * Optional; when set, uses `FormControlLabel` with `labelPlacement`.
   * Omit for standalone toggles (e.g. grid cells).
   */
  label?: FormControlLabelProps["label"];
  /**
   * MUI label position relative to the thumb (`end`, `start`, `top`, `bottom`).
   * @defaultValue `"end"`
   */
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  /** Shown under the switch when wrapped in `FormControl`. */
  helperText?: string;
  /** Sets `FormControl` error state for helper text color. */
  error?: boolean;
  /** On the outer `FormControl` when a wrapper is rendered. */
  wrapperClassName?: string;
}

/**
 * Boolean toggle using MUI `Switch`, optionally with label and helper text.
 *
 * @remarks
 * Prefer over `Checkbox` when the UX should read as an on/off setting rather than
 * “select this item”.
 *
 * @param props - {@link SwitchInputProps}
 * @returns `Switch` or `FormControl` + `FormControlLabel` + optional helper.
 *
 * @example
 * ```tsx
 * // Form usage
 * <SwitchInput label="Enable notifications" checked={enabled} onChange={handleChange} />
 *
 * // Grid inline-edit (standalone)
 * <SwitchInput checked={active} onChange={handleToggle} size="small" />
 * ```
 */
const SwitchInput = ({
  label,
  labelPlacement = "end",
  helperText,
  error,
  wrapperClassName,
  className,
  ...rest
}: SwitchInputProps) => {
  const switchEl = <Switch className={className} {...rest} />;

  if (!label && !helperText) return switchEl;

  return (
    <FormControl error={error} className={wrapperClassName}>
      {label ? (
        <FormControlLabel
          control={switchEl}
          label={label}
          labelPlacement={labelPlacement}
        />
      ) : (
        switchEl
      )}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SwitchInput;
