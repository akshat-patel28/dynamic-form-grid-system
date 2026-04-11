"use client";

import Link from "next/link";
import { Grid, CELL_INPUT_RENDERERS } from "@/_components/grid";
import type { ColumnDef } from "@/_components/grid";
import { PAGE_ROUTE } from "@/helpers/constant/constant";
import { DEMO_ROWS } from "@/helpers/mock/gridDemoData";
import type { EmployeeRow } from "@/helpers/mock/gridDemoData";

/**
 * Column schema for the demo grid.
 *
 * Defines 22 columns to demonstrate horizontal scrolling behaviour when the
 * total column width exceeds the viewport. Each `field` value maps to the
 * matching key in {@link DEMO_ROWS}.
 */
const DEMO_COLUMNS: ColumnDef<EmployeeRow>[] = [
  { field: "select", checkboxSelection: true },
  { headerName: "ID", field: "id", maxWidth: "80px" },
  {
    headerName: "First Name",
    field: "firstName",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    headerName: "Last Name",
    field: "lastName",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.TEXT_INPUT,
  },
  {
    headerName: "Email",
    field: "email",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.EMAIL_INPUT,
  },
  { headerName: "Phone", field: "phone" },
  { headerName: "Department", field: "department" },
  { headerName: "Designation", field: "designation" },
  { headerName: "Employee Code", field: "employeeCode", maxWidth: "160px" },
  {
    headerName: "Date of Join",
    field: "dateOfJoin",
    maxWidth: "140px",
    editable: true,
    cellInputRenderer: CELL_INPUT_RENDERERS.DATE_INPUT,
  },
  { headerName: "Date of Birth", field: "dateOfBirth" },
  { headerName: "Gender", field: "gender", maxWidth: "110px" },
  { headerName: "Location", field: "location" },
  { headerName: "City", field: "city" },
  { headerName: "State", field: "state" },
  { headerName: "Country", field: "country" },
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
  { headerName: "Status", field: "status", maxWidth: "120px" },
  { headerName: "Last Updated", field: "lastUpdated" },
];

/**
 * DynamicGridPage
 *
 * Demo page for the `<Grid />` component.
 *
 * Renders the grid with 22 columns and 50 mock rows sourced from
 * `helpers/mock/gridDemoData.ts`. The combined minimum column width (~4 400 px)
 * exceeds most viewport widths, demonstrating horizontal scroll. Vertical
 * scroll is triggered by the 50 rows within the constrained container height.
 *
 * @returns The page layout containing the grid demo.
 */
export default function DynamicGridPage() {
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
      <p
        style={{ marginBottom: "20px", fontSize: "0.875rem", color: "#64748b" }}
      >
        22 columns · 50 rows · horizontal + vertical scroll
      </p>

      <Grid columnDefs={DEMO_COLUMNS} rowData={DEMO_ROWS} />
    </main>
  );
}
