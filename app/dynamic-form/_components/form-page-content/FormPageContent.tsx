"use client";

/**
 * @fileoverview Main content region for the dynamic-form page after (or beside)
 * loading state.
 *
 * Composes four concerns in a fixed order:
 * 1. **Error** — HTTP/network failure message (if `error` is set).
 * 2. **Stepper form** — rendered only when the request succeeded, is not
 *    loading, and there is at least one row (`comments.length > 0`). Remounts
 *    when `apiPage` changes via `key={apiPage}`.
 * 3. **API pagination** — shown whenever `totalCount > 0`, including while
 *    `loading` is true (controls are disabled in that case so users cannot
 *    change pages mid-fetch).
 * 4. **Empty state** — short message when the request finished successfully
 *    but returned no rows.
 *
 * Loading UI itself is **not** included here; pair this component with
 * `PageLoader` in the parent when `loading` is true.
 */

import type { ObjectSchema } from "yup";
import type { CommentFormRow } from "@/helpers/types/types";
import DataPagination from "@/_components/pagination";
import StepperForm from "@/_components/stepper-form";
import type { FormFieldDef } from "@/_components/stepper-form";

/**
 * Props for {@link FormPageContent}.
 *
 * @remarks
 * `loading` and `error` are expected to come from the same async source (e.g.
 * `useApi`) so that `error` is cleared on a successful refetch.
 */
export type FormPageContentProps = {
  /**
   * When `true`, the stepper and empty message are hidden; pagination may still
   * render but is non-interactive (`DataPagination` `disabled`).
   */
  loading: boolean;

  /**
   * Set after a failed request. When non-null, the error message is shown and
   * the stepper is not rendered.
   */
  error: Error | null;

  /**
   * Current page of transformed row data (one comment per step in the stepper).
   */
  comments: CommentFormRow[];

  /**
   * 1-based index of the active API page; passed to `StepperForm` as `key` so
   * the form resets when the user changes pages.
   */
  apiPage: number;

  /**
   * Total items reported by the API (used for pagination labels and page count).
   */
  totalCount: number;

  /**
   * Total number of API pages (`Math.ceil(totalCount / pageSize)` in the parent).
   */
  totalApiPages: number;

  /**
   * Called when the user picks a different page in `DataPagination`.
   */
  onPageChange: (page: number) => void;

  /**
   * Same field definitions passed to `StepperForm` (labels, renderers, options).
   */
  fieldDefs: FormFieldDef<CommentFormRow>[];

  /**
   * Yup object schema for per-row validation inside `StepperForm`.
   *
   * Typed loosely as `ObjectSchema<any>` to match `StepperForm`’s public API.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: ObjectSchema<any>;
};

/**
 * Renders error, stepper, server-driven pagination, and empty list for the
 * dynamic-form route.
 *
 * @param props - See {@link FormPageContentProps}.
 *
 * @returns A fragment containing whichever branches apply for the current
 *   `loading`, `error`, and `comments` state.
 */
export default function FormPageContent({
  loading,
  error,
  comments,
  apiPage,
  totalCount,
  totalApiPages,
  onPageChange,
  fieldDefs,
  validationSchema,
}: FormPageContentProps) {
  return (
    <>
      {error && (
        <p style={{ color: "#b00020", fontSize: "0.875rem" }}>{error.message}</p>
      )}

      {!loading && !error && comments.length > 0 && (
        <StepperForm<CommentFormRow>
          key={apiPage}
          fieldDefs={fieldDefs}
          rowData={comments}
          validationSchema={validationSchema}
          onSubmit={(allRows) => {
            console.log("Submitted all rows:", allRows);
          }}
        />
      )}

      {totalCount > 0 && (
        <div style={{ marginTop: "24px" }}>
          <DataPagination
            page={apiPage}
            totalPages={totalApiPages}
            totalItems={totalCount}
            disabled={loading}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {!loading && !error && comments.length === 0 && (
        <p style={{ fontSize: "0.875rem", color: "#666" }}>No comments found.</p>
      )}
    </>
  );
}
