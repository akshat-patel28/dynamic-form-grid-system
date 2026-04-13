/**
 * @fileoverview Dynamic Grid demo page.
 *
 * Fetches posts from JSONPlaceholder (`GET /posts`) with `_page` / `_limit`
 * pagination, merges each post with a rotating mock employee row from
 * {@link DEMO_ROWS}, and renders the result in `<Grid />` using {@link DEMO_COLUMNS}.
 *
 * While data loads, {@link GridLoader} mirrors the grid layout (same `columnDefs`
 * and viewport class). API pagination uses `<DataPagination />`; changing the
 * page refetches posts. A synthetic totals row is pinned with
 * `stickyFooterRowIndex` (salary sum for the current page).
 *
 * Base URL: `NEXT_PUBLIC_JSONPLACEHOLDER_BASE_URL` or the public JSONPlaceholder
 * host — same pattern as `app/dynamic-form/page.tsx`.
 */

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import pageStyles from "./page.module.css";
import GridLoader from "./_components/grid-loader/GridLoader";
import { Grid, CELL_INPUT_RENDERERS } from "@/_components/grid";
import type { ColumnDef } from "@/_components/grid";

const DataPagination = dynamic(() => import("@/_components/pagination"), {
  ssr: false,
});
import { PAGE_ROUTE } from "@/helpers/constant/constant";
import { useApi } from "@/helpers/hooks/useApi";
import { DEMO_ROWS } from "@/helpers/mock/gridDemoData";
import type { EmployeeRow } from "@/helpers/mock/gridDemoData";
import type { JsonPlaceholderPost } from "@/helpers/types/types";

const JSONPLACEHOLDER_BASE_URL =
  process.env.NEXT_PUBLIC_JSONPLACEHOLDER_BASE_URL ??
  "https://jsonplaceholder.typicode.com";

const POSTS_API_BASE = `${JSONPLACEHOLDER_BASE_URL.replace(/\/$/, "")}/posts`;

/** JSONPlaceholder serves 100 posts; used for pagination totals (same idea as comments on the form page). */
const JSON_PLACEHOLDER_POSTS_TOTAL = 100;

const API_PAGE_LIMIT = 20;

/**
 * Validates inline-edited person name fields (first / last name columns).
 *
 * @param label - Human-readable field label used in error messages (e.g. `"First name"`).
 * @param value - Raw cell value from the grid (coerced to string).
 * @returns `null` when valid, otherwise a short error message shown on failed commit.
 */
function validatePersonName(label: string, value: unknown): string | null {
  const s = (typeof value === "string" ? value : "").trim();
  if (!s) return `${label} is required`;
  if (s.length < 2) return `${label} must be at least 2 characters`;
  if (s.length > 80) return `${label} must be at most 80 characters`;
  return null;
}

/**
 * Builds grid rows by overlaying API post fields onto mock {@link DEMO_ROWS} records.
 *
 * @remarks
 * **Why merge:** `/posts` only returns `userId`, `id`, `title`, and `body`. The grid
 * keeps a fixed 22-column {@link DEMO_COLUMNS} schema; mock rows supply the rest
 * (names, salary, dates, etc.).
 *
 * **Mapping:** `id` ← post id; `designation` ← title; `department` ← `Post · user {userId}`;
 * `team` ← body (whitespace-normalised, max ~180 chars); `employeeCode` and `manager`
 * ← user id hints. Other fields come from the mock row chosen by global index
 * `(apiPage - 1) * API_PAGE_LIMIT + i` modulo `DEMO_ROWS.length`.
 *
 * @param posts - Slice returned for the current API page (typically length `API_PAGE_LIMIT`).
 * @param apiPage - One-based page index (must match the `_page` query used to fetch `posts`).
 * @returns One {@link EmployeeRow} per post, ready for `<Grid rowData={…} />` (before footer).
 */
function mergePostsWithMockEmployeeRows(
  posts: JsonPlaceholderPost[],
  apiPage: number,
): EmployeeRow[] {
  const start = (apiPage - 1) * API_PAGE_LIMIT;
  return posts.map((post, i) => {
    const mock = DEMO_ROWS[(start + i) % DEMO_ROWS.length];
    const bodyPreview = post.body.split(/\s+/).join(" ").trim();
    const truncated =
      bodyPreview.length > 180 ? `${bodyPreview.slice(0, 180)}…` : bodyPreview;
    return {
      ...mock,
      id: post.id,
      designation: post.title,
      department: `Post · user ${post.userId}`,
      team: truncated,
      employeeCode: `${mock.employeeCode} · U${post.userId}`,
      manager: `User ${post.userId}`,
    };
  });
}

/**
 * Creates the sticky summary row shown below the current page of data rows.
 *
 * @param dataRows - Merged employee rows for the active page (footer row excluded).
 * @param totalItemCount - Total posts in the dataset ({@link JSON_PLACEHOLDER_POSTS_TOTAL}),
 *   used only for the subtitle in `lastName`.
 * @returns A single {@link EmployeeRow} with `firstName` `"Totals"`, summed numeric
 *   `salary` across `dataRows`, placeholder strings for most columns, and `id` `0`.
 */
function buildFooterRow(
  dataRows: EmployeeRow[],
  totalItemCount: number,
): EmployeeRow {
  const totalSalary = dataRows.reduce(
    (acc, row) => acc + (typeof row.salary === "number" ? row.salary : 0),
    0,
  );
  return {
    ...DEMO_ROWS[0],
    id: 0,
    firstName: "Totals",
    lastName: `(${dataRows.length} rows · ${totalItemCount} posts)`,
    email: "—",
    phone: "—",
    department: "—",
    designation: "—",
    employeeCode: "—",
    dateOfJoin: "—",
    dateOfBirth: "—",
    gender: "—",
    location: "—",
    city: "—",
    state: "—",
    country: "—",
    pincode: "—",
    salary: totalSalary,
    currency: "USD",
    manager: "—",
    team: "—",
    status: "—",
    lastUpdated: "—",
    enabled: false,
  };
}

/**
 * Column schema for the demo `<Grid />` and {@link GridLoader}.
 *
 * Defines 22 columns so combined minimum widths exceed typical viewports
 * (horizontal scroll). Each `field` matches keys on {@link EmployeeRow} after
 * {@link mergePostsWithMockEmployeeRows} (mock base + API overlays).
 */
const DEMO_COLUMNS: ColumnDef<EmployeeRow>[] = [
  { field: "select", checkboxSelection: true },
  { headerName: "ID", field: "id", maxWidth: "80px" },
  {
    headerName: "First Name",
    field: "firstName",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
    validateCellValue: ({ value }) => validatePersonName("First name", value),
  },
  {
    headerName: "Last Name",
    field: "lastName",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
    validateCellValue: ({ value }) => validatePersonName("Last name", value),
  },
  {
    headerName: "Email",
    field: "email",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.EMAIL_INPUT,
  },
  { headerName: "Phone", field: "phone" },
  {
    headerName: "Department",
    field: "department",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    headerName: "Designation",
    field: "designation",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  { headerName: "Employee Code", field: "employeeCode", maxWidth: "160px" },
  {
    headerName: "Date of Join",
    field: "dateOfJoin",
    maxWidth: "140px",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.DATE_INPUT,
  },
  {
    headerName: "Date of Birth",
    field: "dateOfBirth",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.DATE_INPUT,
  },
  { headerName: "Gender", field: "gender", maxWidth: "110px" },
  {
    headerName: "Location",
    field: "location",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    headerName: "City",
    field: "city",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    headerName: "State",
    field: "state",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    headerName: "Country",
    field: "country",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  { headerName: "Pincode", field: "pincode", maxWidth: "130px" },
  {
    headerName: "Salary",
    field: "salary",
    maxWidth: "160px",
    valueFormatter: ({ rowData }) => {
      const raw = rowData.salary;
      const num =
        typeof raw === "number"
          ? raw
          : Number.parseFloat(String(raw).replaceAll(",", ""));
      if (Number.isNaN(num)) return String(raw ?? "");
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: String(rowData.currency),
        maximumFractionDigits: 0,
      }).format(num);
    },
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.NUMBER_INPUT,
  },
  { headerName: "Currency", field: "currency", maxWidth: "110px" },
  { headerName: "Manager", field: "manager" },
  { headerName: "Team", field: "team" },
  {
    headerName: "Status",
    field: "status",
    maxWidth: "160px",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.DROPDOWN_INPUT,
    cellInputOptions: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
      { value: "On Leave", label: "On Leave" },
      { value: "Terminated", label: "Terminated" },
    ],
  },
  { headerName: "Last Updated", field: "lastUpdated" },
  {
    headerName: "Enabled",
    field: "enabled",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.SWITCH_INPUT,
    valueFormatter: ({ rowData }) => (rowData.enabled ? "Enabled" : "Disabled"),
  },
];

/**
 * Demo route: paginated JSONPlaceholder posts inside the shared `<Grid />` shell.
 *
 * @remarks
 * **State:** `apiPage` drives `useApi` endpoint; `mergedDataRows` / `rowsWithFooter`
 * are derived with `useMemo`. The grid is hidden while `loading` and replaced by
 * {@link GridLoader}.
 *
 * **Layout:** Main column lists back link, title, blurb, error line (if any),
 * loader or grid or empty message, then {@link DataPagination} (disabled during load).
 *
 * @returns The `/dynamic-grid` page: navigation chrome plus loader, grid, or empty state.
 */
export default function DynamicGridPage() {
  const [apiPage, setApiPage] = useState(1);

  const endpoint = useMemo(
    () => `${POSTS_API_BASE}?_page=${apiPage}&_limit=${API_PAGE_LIMIT}`,
    [apiPage],
  );

  const { data, loading, error } = useApi<JsonPlaceholderPost[]>({
    endpoint,
    method: "GET",
  });

  const mergedDataRows = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return mergePostsWithMockEmployeeRows(list, apiPage);
  }, [data, apiPage]);

  const totalApiPages = Math.max(
    1,
    Math.ceil(JSON_PLACEHOLDER_POSTS_TOTAL / API_PAGE_LIMIT),
  );

  const rowsWithFooter = useMemo(() => {
    if (mergedDataRows.length === 0) return [];
    return [
      ...mergedDataRows,
      buildFooterRow(mergedDataRows, JSON_PLACEHOLDER_POSTS_TOTAL),
    ];
  }, [mergedDataRows]);

  const stickyFooterRowIndex =
    mergedDataRows.length > 0 ? mergedDataRows.length : undefined;

  return (
    <main style={{ padding: "24px" }}>
      <Link
        href={PAGE_ROUTE.HOME}
        style={{
          display: "inline-block",
          marginBottom: "16px",
          fontSize: "0.875rem",
        }}
      >
        ← Back
      </Link>

      <h1
        style={{
          marginBottom: "4px",
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#1e293b",
        }}
      >
        Dynamic Grid
      </h1>

      {error && (
        <p
          style={{
            color: "#b00020",
            fontSize: "0.875rem",
            marginBottom: "12px",
          }}
        >
          {error.message}
        </p>
      )}

      {loading && (
        <GridLoader
          columnDefs={DEMO_COLUMNS}
          rowCount={API_PAGE_LIMIT}
          className={pageStyles.gridViewport}
        />
      )}

      {!loading && rowsWithFooter.length > 0 && (
        <Grid
          columnDefs={DEMO_COLUMNS}
          rowData={rowsWithFooter}
          stickyFooterRowIndex={stickyFooterRowIndex}
          className={pageStyles.gridViewport}
          onCellValueChanged={({ field, oldValue, newValue }) => {
            console.log(
              `Cell value changed — field: "${field}", old: ${JSON.stringify(oldValue)}, new: ${JSON.stringify(newValue)}`,
            );
          }}
        />
      )}

      {!loading && !error && mergedDataRows.length === 0 && (
        <p style={{ fontSize: "0.875rem", color: "#666" }}>No posts found.</p>
      )}

      {JSON_PLACEHOLDER_POSTS_TOTAL > 0 && (
        <div style={{ marginTop: "20px" }}>
          <DataPagination
            page={apiPage}
            totalPages={totalApiPages}
            totalItems={JSON_PLACEHOLDER_POSTS_TOTAL}
            disabled={loading}
            onPageChange={setApiPage}
          />
        </div>
      )}
    </main>
  );
}
