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
import { PAGE_ROUTE } from "@/helpers/constant/constant";
import { useApi } from "@/helpers/hooks/useApi";
import type { CommentFormRow, JsonPlaceholderComment } from "@/helpers/types/types";
import { todayDateStringLocal, transformComments } from "@/helpers/utils/utils";
import FormPageContent from "./_components/form-page-content/FormPageContent";
import PageLoader from "./_components/page-loader/PageLoader";
import { CELL_INPUT_RENDERERS } from "@/_components/grid";
import type { FormFieldDef } from "@/_components/stepper-form";
import * as Yup from "yup";

/** JSONPlaceholder exposes this total via `x-total-count` for `/comments`. */
const JSON_PLACEHOLDER_COMMENTS_TOTAL = 500;

const JSONPLACEHOLDER_BASE_URL =
  process.env.NEXT_PUBLIC_JSONPLACEHOLDER_BASE_URL ??
  "https://jsonplaceholder.typicode.com";

/** Base URL for comments (pagination: `_page`, `_limit`). */
const COMMENTS_API_BASE = `${JSONPLACEHOLDER_BASE_URL.replace(/\/$/, "")}/comments`;

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
  {
    field: "category",
    label: "Category",
    inputRenderer: CELL_INPUT_RENDERERS.DROPDOWN_INPUT,
    options: [
      { value: "general", label: "General" },
      { value: "bug", label: "Bug" },
      { value: "feature", label: "Feature" },
      { value: "question", label: "Question" },
    ],
  },
  {
    field: "featured",
    label: "Featured",
    inputRenderer: CELL_INPUT_RENDERERS.CHECKBOX_INPUT,
  },
  {
    field: "priority",
    label: "Priority",
    inputRenderer: CELL_INPUT_RENDERERS.RADIO_INPUT,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
  {
    field: "verified",
    label: "Verified",
    inputRenderer: CELL_INPUT_RENDERERS.SWITCH_INPUT,
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

      {loading && <PageLoader fieldDefs={COMMENT_FIELDS} />}

      <FormPageContent
        loading={loading}
        error={error}
        comments={comments}
        apiPage={apiPage}
        totalCount={totalCount}
        totalApiPages={totalApiPages}
        onPageChange={setApiPage}
        fieldDefs={COMMENT_FIELDS}
        validationSchema={commentValidationSchema}
      />
    </main>
  );
}
