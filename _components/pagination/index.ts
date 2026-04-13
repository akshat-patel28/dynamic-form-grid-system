/**
 * @fileoverview Barrel for the standalone pagination widget.
 *
 * **Default export:** `DataPagination` — MUI pagination + “Page X of Y” copy.
 * **Named type export:** {@link DataPaginationProps}.
 *
 * For row stepping inside a multi-record form, use `@/_components/stepper-form`
 * (`StepperPagination`) instead; this module is for **dataset / API page** navigation.
 *
 * @example
 * ```tsx
 * import DataPagination from "@/_components/pagination";
 * import type { DataPaginationProps } from "@/_components/pagination";
 * ```
 */

export { default } from "./DataPagination";
export type { DataPaginationProps } from "./types";
