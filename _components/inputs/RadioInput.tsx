"use client";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import type { RadioGroupProps } from "@mui/material/RadioGroup";
import type { RadioProps } from "@mui/material/Radio";

/**
 * A single option rendered inside the radio group.
 */
export interface RadioOption {
  /** The value associated with this radio button. */
  value: string | number;
  /** Human-readable label rendered next to the radio button. */
  label: string;
  /** When `true`, this option is visible but not selectable. */
  disabled?: boolean;
}

/**
 * Props for the {@link RadioInput} component.
 *
 * Extends MUI `RadioGroupProps` so every native RadioGroup prop is available.
 */
export interface RadioInputProps extends RadioGroupProps {
  /** Group label displayed above the radio buttons. */
  label?: string;
  /** List of selectable options. */
  options: RadioOption[];
  /** Helper / error text rendered below the group. */
  helperText?: string;
  /** When `true`, the group is styled as having an error. */
  error?: boolean;
  /** When `true`, the group is disabled. */
  disabled?: boolean;
  /** When `true`, the group is marked as required. */
  required?: boolean;
  /** Props forwarded to every MUI `Radio` element. */
  radioProps?: Omit<RadioProps, "value" | "disabled">;
  /** Extra class applied to the outer `FormControl`. */
  wrapperClassName?: string;
}

/**
 * RadioInput
 *
 * A radio-button group built on MUI `RadioGroup` with label, helper text, and
 * error support.
 *
 * Works in both **form layouts** (vertical, with label) and **grid inline-edit**
 * (horizontal, compact) scenarios.
 *
 * @example
 * ```tsx
 * // Form usage
 * <RadioInput
 *   label="Gender"
 *   value={gender}
 *   onChange={handleChange}
 *   options={[
 *     { value: "male", label: "Male" },
 *     { value: "female", label: "Female" },
 *     { value: "other", label: "Other" },
 *   ]}
 * />
 *
 * // Grid inline-edit (horizontal, compact)
 * <RadioInput
 *   row
 *   value={priority}
 *   onChange={handleChange}
 *   options={priorityOptions}
 *   radioProps={{ size: "small" }}
 * />
 * ```
 */
const RadioInput = ({
  label,
  options,
  helperText,
  error,
  disabled,
  required,
  radioProps,
  wrapperClassName,
  ...rest
}: RadioInputProps) => {
  return (
    <FormControl
      error={error}
      disabled={disabled}
      required={required}
      className={wrapperClassName}
    >
      {label && <FormLabel>{label}</FormLabel>}
      <RadioGroup {...rest}>
        {options.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            label={opt.label}
            disabled={opt.disabled}
            control={<Radio {...radioProps} />}
          />
        ))}
      </RadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default RadioInput;
