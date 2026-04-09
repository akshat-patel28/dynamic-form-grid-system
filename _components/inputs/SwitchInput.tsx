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
 * Extends MUI `SwitchProps` so every native Switch prop is available.
 */
export interface SwitchInputProps extends SwitchProps {
  /** Label displayed next to the switch. When omitted the switch renders standalone. */
  label?: FormControlLabelProps["label"];
  /** Placement of the label relative to the switch. @default "end" */
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  /** Helper / error text rendered below the switch. */
  helperText?: string;
  /** When `true`, helper text is styled as an error. */
  error?: boolean;
  /** Extra class applied to the outer wrapper. */
  wrapperClassName?: string;
}

/**
 * SwitchInput
 *
 * A toggle switch built on MUI `Switch` with optional label and helper text.
 *
 * Works in both **form layouts** (with label + helper) and
 * **grid inline-edit** (standalone) scenarios.
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
