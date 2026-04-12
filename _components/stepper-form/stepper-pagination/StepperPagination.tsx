/**
 * @fileoverview Row-level stepper navigation bar for the stepper form.
 *
 * Provides controls for moving between rows (steps) **within the
 * current page of data**:
 * - First / Previous / Next / Last icon buttons
 * - "Row X of Y" label
 * - Compact text field for direct row-number jump
 *
 * API-level pagination (fetching new pages of data) is handled
 * separately at the page level, not here.
 *
 * @example
 * <StepperPagination
 *   activeStep={0}
 *   totalSteps={10}
 *   onStepChange={(step) => setActiveStep(step)}
 * />
 */

"use client";

import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import type { StepperPaginationProps } from "../helpers/types/types";

/**
 * StepperPagination
 *
 * Renders a navigation bar for stepping between rows within the current
 * dataset. All indices are **zero-based** internally but displayed as
 * **one-based** to the user (e.g. "Row 1 of 10").
 *
 * This component only handles **row navigation** — it does not trigger
 * API calls. API-level pagination lives at the page level.
 *
 * @param props - {@link StepperPaginationProps}
 * @returns The stepper navigation bar.
 *
 * @example
 * <StepperPagination
 *   activeStep={currentStep}
 *   totalSteps={people.length}
 *   onStepChange={handleStepChange}
 * />
 */
const StepperPagination = ({
  activeStep,
  totalSteps,
  onStepChange,
}: StepperPaginationProps) => {
  const [jumpValue, setJumpValue] = useState("");

  const isFirst = activeStep === 0;
  const isLast = activeStep === totalSteps - 1;

  /**
   * Navigates to the given zero-based step index after clamping
   * it within valid bounds.
   *
   * @param step - Desired zero-based step index.
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
        mt: 3,
      }}
    >
      {/* First / Previous */}
      <IconButton
        size="small"
        disabled={isFirst}
        onClick={() => goTo(0)}
        aria-label="First row"
      >
        <FirstPageIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        disabled={isFirst}
        onClick={() => goTo(activeStep - 1)}
        aria-label="Previous row"
      >
        <NavigateBeforeIcon fontSize="small" />
      </IconButton>

      {/* Step label */}
      <Typography variant="body2" sx={{ mx: 1, color: "text.secondary" }}>
        Row {activeStep + 1} of {totalSteps}
      </Typography>

      {/* Next / Last */}
      <IconButton
        size="small"
        disabled={isLast}
        onClick={() => goTo(activeStep + 1)}
        aria-label="Next row"
      >
        <NavigateNextIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        disabled={isLast}
        onClick={() => goTo(totalSteps - 1)}
        aria-label="Last row"
      >
        <LastPageIcon fontSize="small" />
      </IconButton>

      {/* Direct row jump input */}
      <TextField
        size="small"
        placeholder="Go to"
        value={jumpValue}
        onChange={handleJumpInputChange}
        onKeyDown={handleJumpKeyDown}
        sx={{ width: 80 }}
        slotProps={{
          htmlInput: {
            min: 1,
            max: totalSteps,
            "aria-label": "Jump to row number",
          },
        }}
        type="number"
      />
    </Box>
  );
};

export default StepperPagination;
