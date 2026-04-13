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
 * One choice in a {@link RadioInput} group.
 *
 * @remarks
 * `value` must be unique within the group and matches `RadioGroup`’s controlled `value`.
 */
export interface RadioOption {
  /** Value submitted / held in group state when this option is selected. */
  value: string | number;
  /** Text beside the radio control via `FormControlLabel`. */
  label: string;
  /** If `true`, only this option is non-interactive; siblings may still be enabled. */
  disabled?: boolean;
}

/**
 * Props for the {@link RadioInput} component.
 *
 * @remarks
 * Inherits `RadioGroup` props (`value`, `onChange`, `row` for horizontal layout, `name`,
 * etc.). The group is wrapped in `FormControl` with optional `FormLabel` and
 * `FormHelperText`.
 */
export interface RadioInputProps extends RadioGroupProps {
  /** Optional `FormLabel` above the group (fieldset legend semantics). */
  label?: string;
  /** Each entry becomes `FormControlLabel` + `Radio` inside `RadioGroup`. */
  options: RadioOption[];
  /** Secondary text below the group; use with `error` for validation messages. */
  helperText?: string;
  /** Passed to `FormControl`; affects label and helper styling. */
  error?: boolean;
  /** Disables the entire group when `true`. */
  disabled?: boolean;
  /** Marks the group required for assistive tech / visual indicator. */
  required?: boolean;
  /** Spread onto every `Radio` (e.g. `size="small"`); per-option `disabled` stays on options. */
  radioProps?: Omit<RadioProps, "value" | "disabled">;
  /** Class on the outer `FormControl`. */
  wrapperClassName?: string;
}

/**
 * Accessible radio group: `FormControl` + `FormLabel` + `RadioGroup` + options.
 *
 * @remarks
 * **Layout:** Pass MUI `RadioGroup` `row` for a single row (common in grids).
 *
 * **Controlled:** Parent owns `value`; `onChange` receives the selected option’s `value`.
 *
 * @param props - {@link RadioInputProps}
 * @returns The full radio group UI subtree.
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
