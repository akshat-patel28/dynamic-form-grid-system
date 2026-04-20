/**
 * @fileoverview Bulk-edit page for rows selected on `/dynamic-grid`.
 *
 * Reads the selection snapshot from {@link DynamicGridContext} (set by the
 * "Edit selected" CTA in the grid page header) and renders a stepper form
 * with one row per step. If the user lands here without a selection (e.g.
 * deep-link / refresh), an empty state is shown with a link back to the grid.
 */

"use client";

import { useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

import { DynamicGridContext } from "../_context/DynamicGridContext";
import StepperForm, {
  type FormFieldDef,
} from "@/_components/stepper-form";
import { CELL_INPUT_RENDERERS } from "@/_components/grid";
import type { EmployeeRow } from "@/helpers/mock/gridDemoData";
import { PAGE_ROUTE } from "@/helpers/constant/constant";

/**
 * Field definitions for each selected `EmployeeRow` in the stepper form.
 *
 * Mirrors the grid's editable columns so the bulk-edit experience stays
 * consistent with inline editing on the grid page.
 */
const EMPLOYEE_FIELDS: FormFieldDef<EmployeeRow>[] = [
  {
    field: "firstName",
    label: "First Name",
    inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    field: "lastName",
    label: "Last Name",
    inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    field: "email",
    label: "Email",
    inputRenderer: CELL_INPUT_RENDERERS.EMAIL_INPUT,
  },
  {
    field: "department",
    label: "Department",
    inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    field: "designation",
    label: "Designation",
    inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    field: "dateOfJoin",
    label: "Date of Join",
    inputRenderer: CELL_INPUT_RENDERERS.DATE_INPUT,
  },
  {
    field: "dateOfBirth",
    label: "Date of Birth",
    inputRenderer: CELL_INPUT_RENDERERS.DATE_INPUT,
  },
  {
    field: "location",
    label: "Location",
    inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    field: "city",
    label: "City",
    inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    field: "state",
    label: "State",
    inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    field: "country",
    label: "Country",
    inputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    field: "salary",
    label: "Salary",
    inputRenderer: CELL_INPUT_RENDERERS.NUMBER_INPUT,
  },
  {
    field: "status",
    label: "Status",
    inputRenderer: CELL_INPUT_RENDERERS.DROPDOWN_INPUT,
    options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
      { value: "On Leave", label: "On Leave" },
      { value: "Terminated", label: "Terminated" },
    ],
  },
  {
    field: "enabled",
    label: "Enabled",
    inputRenderer: CELL_INPUT_RENDERERS.SWITCH_INPUT,
  },
];

/**
 * Shared validation for every row in the stepper form.
 */
const employeeValidationSchema = Yup.object({
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(80, "First name must be at most 80 characters"),
  lastName: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(80, "Last name must be at most 80 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Enter a valid email address"),
  salary: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue == null
        ? Number.NaN
        : Number(value),
    )
    .typeError("Salary must be a number")
    .min(0, "Salary must be non-negative")
    .required("Salary is required"),
});

export default function DynamicGridEditPage() {
  const { selectedRows, clearSelectedRows } = useContext(DynamicGridContext);
  const router = useRouter();

  /**
   * Handles form submission: logs merged rows, clears the shared selection,
   * and returns the user to the grid page.
   */
  const handleSubmit = (rows: EmployeeRow[]) => {
    console.log("Bulk-edited rows:", rows);
    clearSelectedRows();
    router.push(PAGE_ROUTE.DYNAMIC_GRID);
  };

  const rowSuffix = selectedRows.length === 1 ? "" : "s";
  const subtitle =
    selectedRows.length > 0
      ? `Editing ${selectedRows.length} selected row${rowSuffix}. Use the stepper to move between rows.`
      : "No rows selected. Go back to the grid and pick rows to edit.";

  return (
    <main style={{ padding: "24px", maxWidth: "48rem", margin: "0 auto" }}>
      <Link
        href={PAGE_ROUTE.DYNAMIC_GRID}
        style={{
          display: "inline-block",
          marginBottom: "12px",
          fontSize: "0.875rem",
        }}
      >
        &larr; Back to Grid
      </Link>

      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
        Bulk Edit Selected Rows
      </h1>
      <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "16px" }}>
        {subtitle}
      </p>

      {selectedRows.length > 0 && (
        <StepperForm<EmployeeRow>
          fieldDefs={EMPLOYEE_FIELDS}
          rowData={selectedRows}
          validationSchema={employeeValidationSchema}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}
