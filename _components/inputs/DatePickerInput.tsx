"use client";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import type { DatePickerProps } from "@mui/x-date-pickers/DatePicker";

/**
 * Props for the {@link DatePickerInput} component.
 *
 * Extends MUI X `DatePickerProps` so every native DatePicker prop is available.
 *
 * **Note:** The consumer must wrap this component (or the app) in a
 * `LocalizationProvider` with the date adapter of their choice
 * (dayjs, date-fns, luxon, etc.).
 */
export interface DatePickerInputProps extends DatePickerProps {
  /** Helper / error text rendered below the picker. */
  helperText?: string;
  /** When `true`, the field is styled as having an error. */
  error?: boolean;
  /** When `true`, the field stretches to its parent's width. @default true */
  fullWidth?: boolean;
  /** Extra class applied to the outer wrapper. */
  wrapperClassName?: string;
}

/**
 * DatePickerInput
 *
 * A date picker built on MUI X `DatePicker`.
 *
 * Works in both **form layouts** and **grid inline-edit** contexts.
 *
 * Requires a `LocalizationProvider` ancestor with any date adapter
 * (dayjs, date-fns, luxon, etc.).
 *
 * @example
 * ```tsx
 * import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
 * import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
 *
 * <LocalizationProvider dateAdapter={AdapterDayjs}>
 *   <DatePickerInput label="Start Date" value={date} onChange={setDate} />
 * </LocalizationProvider>
 * ```
 */
const DatePickerInput = ({
  helperText,
  error,
  fullWidth = true,
  wrapperClassName,
  ...rest
}: DatePickerInputProps) => {
  return (
    <FormControl
      error={error}
      fullWidth={fullWidth}
      className={wrapperClassName}
    >
      <DatePicker {...rest} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default DatePickerInput;
