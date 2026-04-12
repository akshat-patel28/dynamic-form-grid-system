/**
 * @fileoverview Dynamic Form demo page.
 *
 * Fetches comments from JSONPlaceholder (`/comments`) with `_page` / `_limit`
 * pagination and renders them inside `<StepperForm />`. Each comment is one
 * step; row-level navigation uses the stepper controls inside the form.
 *
 * API pagination uses `<DataPagination />` below the form. Changing the page
 * refetches comments; the form receives the current `rowData` only.
 *
 * Raw API rows are transformed before being passed to the form: each item
 * gets `rating` (1–5) and `createdAt` (ISO-8601 calendar date `YYYY-MM-DD`,
 * derived from `toISOString()`, for `type="date"` fields).
 */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { PAGE_ROUTE } from "@/helpers/constant/constant";
import { useApi } from "@/helpers/hooks/useApi";
import type { CommentFormRow, JsonPlaceholderComment } from "@/helpers/types/types";
import { todayDateStringLocal, transformComments } from "@/helpers/utils/utils";
import DataPagination from "@/_components/pagination";
import { CELL_INPUT_RENDERERS } from "@/_components/grid";
import StepperForm from "@/_components/stepper-form";
import type { FormFieldDef } from "@/_components/stepper-form";
import * as Yup from "yup";

/** JSONPlaceholder exposes this total via `x-total-count` for `/comments`. */
const JSON_PLACEHOLDER_COMMENTS_TOTAL = 500;

/** Base URL for comments (pagination: `_page`, `_limit`). */
const COMMENTS_API_BASE = "https://jsonplaceholder.typicode.com/comments";

/** Page size for API and pagination math. */
const API_PAGE_LIMIT = 10;

/**
 * Form field definitions for a comment row.
 */
const COMMENT_FIELDS: FormFieldDef<CommentFormRow>[] = [
  {
    field: "postId",
    label: "Post ID",
    inputRenderer: CELL_INPUT_RENDERERS.NUMBER_INPUT,
  },
  { field: "name", label: "Name", inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT },
  { field: "email", label: "Email", inputRenderer: CELL_INPUT_RENDERERS.EMAIL_INPUT },
  {
    field: "body",
    label: "Body",
    inputRenderer: CELL_INPUT_RENDERERS.TEXTAREA_INPUT,
  },
  {
    field: "rating",
    label: "Rating",
    inputRenderer: CELL_INPUT_RENDERERS.NUMBER_INPUT,
  },
  {
    field: "createdAt",
    label: "Created at",
    inputRenderer: CELL_INPUT_RENDERERS.DATE_INPUT,
  },
];

const commentValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .required("Email is required")
    .email("Enter a valid email address"),
  body: Yup.string()
    .required("Body is required")
    .max(300, "Body must be at most 300 characters"),
  rating: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue == null ? NaN : Number(value),
    )
    .typeError("Rating must be a number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not be more than 5")
    .required("Rating is required"),
  createdAt: Yup.string()
    .required("Created at is required")
    .test(
      "not-after-today",
      "Date cannot be after today",
      (value) => {
        if (!value) return false;
        return value <= todayDateStringLocal();
      },
    ),
});

/**
 * DynamicFormPage
 *
 * Fetches JSONPlaceholder comments with `_page` / `_limit` and renders them
 * in a stepper form. API pagination is separate from row-level stepping.
 *
 * @returns The page layout containing API pagination and the stepper form.
 */
export default function DynamicFormPage() {
  const [apiPage, setApiPage] = useState(1);

  const endpoint = useMemo(
    () =>
      `${COMMENTS_API_BASE}?_page=${apiPage}&_limit=${API_PAGE_LIMIT}`,
    [apiPage],
  );

  const { data, loading, error } = useApi<JsonPlaceholderComment[]>({
    endpoint,
    method: "GET",
  });

  const comments = useMemo(
    () => transformComments(Array.isArray(data) ? data : []),
    [data],
  );

  const totalCount = JSON_PLACEHOLDER_COMMENTS_TOTAL;
  const totalApiPages = Math.max(
    1,
    Math.ceil(totalCount / API_PAGE_LIMIT),
  );

  return (
    <main style={{ padding: "24px", maxWidth: "48rem", margin: "0 auto" }}>
      <Link
        href={PAGE_ROUTE.HOME}
        style={{
          display: "inline-block",
          marginBottom: "12px",
          fontSize: "0.875rem",
        }}
      >
        &larr; Back
      </Link>

      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
        Dynamic Stepper Form
      </h1>
      <p style={{ color: "#555", marginBottom: "16px", fontSize: "0.9rem" }}>
        Comments from{" "}
        <a href={COMMENTS_API_BASE} style={{ color: "inherit" }}>
          JSONPlaceholder
        </a>{" "}
        — one comment per step
      </p>

      {loading && (
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
            {COMMENT_FIELDS.map((def) => {
              const isTextarea =
                def.inputRenderer === CELL_INPUT_RENDERERS.TEXTAREA_INPUT;
              return (
                <Skeleton
                  key={def.field}
                  variant="rounded"
                  height={isTextarea ? 92 : 40}
                  sx={
                    isTextarea
                      ? { gridColumn: { xs: "1", sm: "1 / -1" } }
                      : undefined
                  }
                />
              );
            })}
          </Box>
        </Box>
      )}

      {error && (
        <p style={{ color: "#b00020", fontSize: "0.875rem" }}>
          {error.message}
        </p>
      )}

      {!loading && !error && comments.length > 0 && (
        <StepperForm<CommentFormRow>
          key={apiPage}
          fieldDefs={COMMENT_FIELDS}
          rowData={comments}
          validationSchema={commentValidationSchema}
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
            onPageChange={setApiPage}
          />
        </div>
      )}

      {!loading && !error && comments.length === 0 && (
        <p style={{ fontSize: "0.875rem", color: "#666" }}>
          No comments found.
        </p>
      )}
    </main>
  );
}
