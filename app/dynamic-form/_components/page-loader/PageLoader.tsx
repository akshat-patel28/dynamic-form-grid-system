"use client";

/**
 * @fileoverview Loading placeholder for the dynamic-form page.
 *
 * Renders MUI `Skeleton` blocks whose layout approximates the stepper header
 * (navigation strip) and the responsive field grid used by `StepperForm`. Pass
 * the **same** `fieldDefs` you pass to the form so placeholder heights and
 * column spans stay aligned (textarea full-width on `sm+`, toggles narrow, etc.).
 *
 * @remarks
 * - Exposes `aria-busy="true"` and `aria-label="Loading comments"` on the root
 *   section for assistive tech while data is in flight.
 * - Skeleton dimensions are derived from `CELL_INPUT_RENDERERS` on each field,
 *   not from live DOM measurement.
 */

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { CELL_INPUT_RENDERERS } from "@/_components/grid";
import type { FormFieldDef } from "@/_components/stepper-form";

/**
 * Props for {@link PageLoader}.
 *
 * @template T Row shape used by the eventual `StepperForm` (must extend
 *   `Record<string, unknown>` to match `FormFieldDef`).
 */
type PageLoaderProps<T extends Record<string, unknown> = Record<string, unknown>> = {
  /**
   * Field schema shared with `StepperForm`. Order and `inputRenderer` drive
   * how many skeleton rows are drawn and each block’s height/width.
   */
  fieldDefs: FormFieldDef<T>[];
};

/**
 * Full-page loading skeleton for the comment stepper form.
 *
 * @template T Same row type as the form’s `fieldDefs` (e.g. `CommentFormRow`).
 *
 * @param props - Component props.
 * @param props.fieldDefs - Schema used to build one skeleton cell per field.
 *
 * @returns A `section` containing a title strip skeleton, a stepper-control
 *   strip, and a responsive grid of field-shaped skeletons.
 */
export default function PageLoader<
  T extends Record<string, unknown> = Record<string, unknown>,
>({ fieldDefs }: PageLoaderProps<T>) {
  return (
    <Box
      component="section"
      aria-busy="true"
      aria-label="Loading comments"
      sx={{ width: "100%" }}
    >
      <Skeleton variant="text" width={200} sx={{ fontSize: "0.875rem", mb: 2 }} />
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mb: 3,
        }}
      >
        <Skeleton variant="rounded" width={30} height={30} />
        <Skeleton variant="rounded" width={30} height={30} />
        <Skeleton variant="text" width={72} sx={{ fontSize: "0.8125rem" }} />
        <Skeleton variant="rounded" width={30} height={30} />
        <Skeleton variant="rounded" width={30} height={30} />
        <Skeleton variant="rounded" width={80} height={40} />
        <Skeleton variant="rounded" width={72} height={32} />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {fieldDefs.map((def) => {
          const renderer = def.inputRenderer;
          const isTextarea = renderer === CELL_INPUT_RENDERERS.TEXTAREA_INPUT;
          const isRadio = renderer === CELL_INPUT_RENDERERS.RADIO_INPUT;
          const isToggle =
            renderer === CELL_INPUT_RENDERERS.CHECKBOX_INPUT ||
            renderer === CELL_INPUT_RENDERERS.SWITCH_INPUT;

          const height = isTextarea ? 92 : isRadio ? 72 : isToggle ? 32 : 40;

          return (
            <Skeleton
              key={String(def.field)}
              variant="rounded"
              height={height}
              width={isToggle ? 160 : undefined}
              sx={
                isTextarea ? { gridColumn: { xs: "1", sm: "1 / -1" } } : undefined
              }
            />
          );
        })}
      </Box>
    </Box>
  );
}
