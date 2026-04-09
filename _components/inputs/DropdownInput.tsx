"use client";

import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectProps } from "@mui/material/Select";
import type { FormControlProps } from "@mui/material/FormControl";

/**
 * A single option rendered inside the dropdown.
 */
export interface DropdownOption {
  /** The underlying value stored when this option is selected. */
  value: string | number;
  /** Human-readable label displayed in the menu. */
  label: string;
  /** When `true`, the option is visible but not selectable. */
  disabled?: boolean;
}

/**
 * Props for the {@link DropdownInput} component.
 *
 * Extends MUI `SelectProps` so every native Select prop is available.
 */
export interface DropdownInputProps extends Omit<SelectProps, "variant"> {
  /** MUI variant applied to the field. @default "outlined" */
  variant?: SelectProps["variant"];
  /** List of selectable options. */
  options: DropdownOption[];
  /** Helper / error text rendered below the select. */
  helperText?: string;
  /** Props forwarded to the wrapping `FormControl`. */
  formControlProps?: Omit<FormControlProps, "error" | "disabled" | "required" | "fullWidth" | "size">;
}

/**
 * DropdownInput
 *
 * A select / dropdown field built on MUI `Select` wrapped in a `FormControl`
 * with label and optional helper text.
 *
 * Works in both **form layouts** and **grid inline-edit** contexts.
 *
 * @example
 * ```tsx
 * // Form usage
 * <DropdownInput
 *   label="Country"
 *   value={country}
 *   onChange={handleChange}
 *   options={[
 *     { value: "us", label: "United States" },
 *     { value: "ca", label: "Canada" },
 *   ]}
 * />
 *
 * // Grid inline-edit (compact, no label)
 * <DropdownInput
 *   size="small"
 *   value={status}
 *   onChange={handleChange}
 *   options={statusOptions}
 * />
 * ```
 */
const DropdownInput = ({
  variant = "outlined",
  size = "small",
  fullWidth = true,
  options,
  label,
  helperText,
  error,
  disabled,
  required,
  formControlProps,
  ...rest
}: DropdownInputProps) => {
  return (
    <FormControl
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      error={error}
      disabled={disabled}
      required={required}
      {...formControlProps}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <Select label={label} {...rest}>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default DropdownInput;
