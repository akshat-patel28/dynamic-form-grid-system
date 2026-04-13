"use client";

import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectProps } from "@mui/material/Select";
import type { FormControlProps } from "@mui/material/FormControl";

/**
 * One entry in the {@link DropdownInput} options list.
 *
 * @remarks
 * `value` is what MUI `Select` stores (and what you typically persist). `label` is
 * shown in the closed field and in the menu. Keep `value` stable across renders for
 * controlled selects.
 */
export interface DropdownOption {
  /** Stored form value when this option is selected (MUI `MenuItem` `value`). */
  value: string | number;
  /** Display string in the menu and, with a `label` on the parent, in the field. */
  label: string;
  /** If `true`, the option appears grayed out and cannot be chosen. */
  disabled?: boolean;
}

/**
 * Props for the {@link DropdownInput} component.
 *
 * @remarks
 * Built from MUI `Select` inside `FormControl`. Most `SelectProps` apply to the inner
 * `Select`; `error`, `disabled`, `required`, `fullWidth`, and `size` are applied to
 * `FormControl` for consistent layout and accessibility. Use `formControlProps` for
 * margins, `sx`, `className`, etc., without overriding those controlled props.
 */
export interface DropdownInputProps extends Omit<SelectProps, "variant"> {
  /**
   * MUI `FormControl` / `Select` variant (`outlined`, `filled`, `standard`).
   * @defaultValue `"outlined"`
   */
  variant?: SelectProps["variant"];
  /** Options rendered as `MenuItem` children, in array order. */
  options: DropdownOption[];
  /** Shown below the control via `FormHelperText`; pair with `error` for validation UI. */
  helperText?: string;
  /**
   * Spread onto the outer `FormControl`. Cannot set `error`, `disabled`, `required`,
   * `fullWidth`, or `size` here — those come from top-level props.
   */
  formControlProps?: Omit<FormControlProps, "error" | "disabled" | "required" | "fullWidth" | "size">;
}

/**
 * Labeled select (dropdown) using MUI `FormControl` + `Select` + `MenuItem`.
 *
 * @remarks
 * **Label:** When `label` is provided, an `InputLabel` is rendered and passed to
 * `Select` so the floating-label pattern works. Omit `label` for compact grid cells.
 *
 * **Controlled mode:** Pass `value` and `onChange` per MUI `Select` (event target value).
 *
 * @param props - {@link DropdownInputProps}
 * @returns The form control subtree (`FormControl` → `Select` → `MenuItem`s).
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
