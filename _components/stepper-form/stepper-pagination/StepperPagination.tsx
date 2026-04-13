/**
 * @fileoverview In-form controls to move between records (rows) of the current batch.
 *
 * @remarks
 * **Not API pagination:** Changing rows here does not fetch a new HTTP page. Combine with
 * `@/_components/pagination` (or your router) when the dataset is paged server-side.
 *
 * **Indices:** Props use **zero-based** `activeStep`; the UI shows **one-based** “Row N of M”.
 * The jump field accepts one-based numbers and converts internally.
 *
 * **Submit:** The contained `Button` uses `type="submit"` and must stay inside the `StepperForm`
 * `<form>` so Formik’s `handleSubmit` runs.
 *
 * @example
 * ```tsx
 * <StepperPagination
 *   activeStep={0}
 *   totalSteps={10}
 *   onStepChange={(step) => setActiveStep(step)}
 * />
 * ```
 */

"use client";

import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import type { StepperPaginationProps } from "../helpers/types/types";

/**
 * `sx` fragment: MUI leaves default cursor on disabled icon buttons; this shows `not-allowed`.
 */
const disabledCursorSx = {
  "&.Mui-disabled": { cursor: "not-allowed" },
} as const;

/**
 * Wrapper `Box` style so `Tooltip` can still receive pointer events around a disabled `IconButton`.
 */
const tooltipIconWrapSx = { display: "inline-flex" } as const;

/**
 * Toolbar: first/prev/next/last, row label, numeric jump, and submit.
 *
 * @param props - {@link StepperPaginationProps}
 * @returns A flex `Box` row of controls.
 *
 * @remarks
 * **Jump field:** Local React state `jumpValue` holds the in-progress string; Enter parses
 * a one-based row, calls `goTo(parsed - 1)`, then clears the input. Invalid numbers are ignored.
 *
 * **Disabled shell:** When `disabled`, the outer `Box` sets `cursor: not-allowed` for affordance.
 *
 * @example
 * ```tsx
 * <StepperPagination
 *   activeStep={currentStep}
 *   totalSteps={people.length}
 *   onStepChange={handleStepChange}
 * />
 * ```
 */
const StepperPagination = ({
  activeStep,
  totalSteps,
  onStepChange,
  disabled = false,
  submitLabel = "Submit",
}: StepperPaginationProps) => {
  /** Uncontrolled string for the “Go to” number field until Enter commits. */
  const [jumpValue, setJumpValue] = useState("");

  const isFirst = activeStep === 0;
  const isLast = activeStep === totalSteps - 1;

  /**
   * Clamps `step` to `[0, totalSteps - 1]` and notifies the parent.
   *
   * @param step - Desired zero-based index (may be out of range before clamping).
   */
  const goTo = (step: number) => {
    const clamped = Math.max(0, Math.min(totalSteps - 1, step));
    onStepChange(clamped);
  };

  /**
   * Updates the local jump input state on keystroke.
   *
   * @param e - Input change event.
   */
  const handleJumpInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJumpValue(e.target.value);
  };

  /**
   * Commits the jump when the user presses Enter.
   * Parses the one-based input value and navigates to the
   * corresponding zero-based step.
   *
   * @param e - Keyboard event.
   */
  const handleJumpKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const parsed = Number.parseInt(jumpValue, 10);
    if (!Number.isNaN(parsed)) {
      goTo(parsed - 1);
    }
    setJumpValue("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        mb: 3,
        ...(disabled ? { cursor: "not-allowed" } : {}),
      }}
    >
      {/* First / Previous */}
      <Tooltip title="First">
        <Box component="span" sx={tooltipIconWrapSx}>
          <IconButton
            size="small"
            disabled={disabled || isFirst}
            onClick={() => goTo(0)}
            aria-label="First row"
            sx={disabledCursorSx}
          >
            <FirstPageIcon fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>
      <Tooltip title="Prev">
        <Box component="span" sx={tooltipIconWrapSx}>
          <IconButton
            size="small"
            disabled={disabled || isFirst}
            onClick={() => goTo(activeStep - 1)}
            aria-label="Previous row"
            sx={disabledCursorSx}
          >
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>

      {/* Step label */}
      <Typography variant="body2" sx={{ mx: 1, color: "text.secondary" }}>
        Row {activeStep + 1} of {totalSteps}
      </Typography>

      {/* Next / Last */}
      <Tooltip title="Next">
        <Box component="span" sx={tooltipIconWrapSx}>
          <IconButton
            size="small"
            disabled={disabled || isLast}
            onClick={() => goTo(activeStep + 1)}
            aria-label="Next row"
            sx={disabledCursorSx}
          >
            <NavigateNextIcon fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>
      <Tooltip title="Last">
        <Box component="span" sx={tooltipIconWrapSx}>
          <IconButton
            size="small"
            disabled={disabled || isLast}
            onClick={() => goTo(totalSteps - 1)}
            aria-label="Last row"
            sx={disabledCursorSx}
          >
            <LastPageIcon fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>

      {/* Direct row jump input */}
      <TextField
        size="small"
        placeholder="Go to"
        value={jumpValue}
        onChange={handleJumpInputChange}
        onKeyDown={handleJumpKeyDown}
        disabled={disabled}
        sx={{
          width: 80,
          "& .MuiOutlinedInput-root.Mui-disabled": {
            cursor: "not-allowed",
          },
        }}
        slotProps={{
          htmlInput: {
            min: 1,
            max: totalSteps,
            "aria-label": "Jump to row number",
          },
        }}
        type="number"
      />

      <Button
        type="submit"
        variant="contained"
        size="small"
        disabled={disabled}
        sx={{
          ml: { xs: 0, sm: 1 },
          "&.Mui-disabled": { cursor: "not-allowed" },
        }}
      >
        {submitLabel}
      </Button>
    </Box>
  );
};

export default StepperPagination;
