/**
 * @fileoverview Dynamic Form demo page.
 *
 * Fetches people from the Star Wars API (SWAPI) and renders them inside
 * a `<StepperForm />`. Each person becomes one step; the user can
 * navigate and edit fields via the stepper row controls.
 *
 * API pagination is handled by a standalone `<DataPagination />`
 * component below the form, fully independent of it. Changing the page
 * fetches a new batch of people from SWAPI; the form simply receives
 * whatever `rowData` is current.
 *
 * The field schema (`PERSON_FIELDS`) is defined once using `FormFieldDef`
 * and drives the entire form — no JSX changes needed when the schema
 * changes.
 */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PAGE_ROUTE } from "@/helpers/constant/constant";
import { useApi } from "@/helpers/hooks/useApi";
import DataPagination from "@/_components/pagination";
import StepperForm from "@/_components/stepper-form";
import type { FormFieldDef } from "@/_components/stepper-form";
import * as Yup from "yup";

/**
 * Shape of a single person returned by the SWAPI `/people` endpoint.
 */
type SwapiPerson = {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
  [key: string]: unknown;
};

/**
 * Shape of the paginated response from SWAPI `/people`.
 */
type SwapiPeopleResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: SwapiPerson[];
};

/** Base URL for the SWAPI people endpoint. */
const SWAPI_PEOPLE_URL = "https://swapi.dev/api/people";

/** SWAPI returns 10 results per page. */
const SWAPI_PAGE_SIZE = 10;

/**
 * Form field definitions for a SWAPI person.
 *
 * Each entry maps to one MUI `<TextField />` in the stepper form.
 * The `inputRenderer` value determines the HTML input type via
 * the `fieldRendererMap` utility.
 */
const PERSON_FIELDS: FormFieldDef<SwapiPerson>[] = [
  { field: "name", label: "Name", inputRenderer: "textInput" },
  { field: "height", label: "Height", inputRenderer: "numberInput" },
  { field: "mass", label: "Mass", inputRenderer: "numberInput" },
  {
    field: "hair_color",
    label: "Hair Color",
    inputRenderer: "textInput",
    placeholder: "e.g. blond",
  },
  {
    field: "skin_color",
    label: "Skin Color",
    inputRenderer: "textInput",
    placeholder: "e.g. fair",
  },
  {
    field: "eye_color",
    label: "Eye Color",
    inputRenderer: "textInput",
    placeholder: "e.g. blue",
  },
  { field: "birth_year", label: "Birth Year", inputRenderer: "textInput" },
  { field: "gender", label: "Gender", inputRenderer: "textInput" },
];

/**
 * Yup validation schema for a single SWAPI person row.
 *
 * All validation rules (required, type checks, etc.) live here —
 * the field definitions stay purely structural.
 */
const personValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
});

/**
 * DynamicFormPage
 *
 * Fetches SWAPI people with API-level pagination and renders
 * the current page of results in a stepper form.
 *
 * - MUI `<Pagination />` controls which **page** of data is fetched
 *   from the API.
 * - The stepper row controls (inside `<StepperForm />`) navigate
 *   between individual rows **within** the current page.
 *
 * @returns The page layout containing API pagination and the stepper form.
 */
export default function DynamicFormPage() {
  /** One-based API page number. */
  const [apiPage, setApiPage] = useState(1);

  /**
   * Build the endpoint URL whenever the API page changes.
   * SWAPI uses `?page=N` for pagination.
   */
  const endpoint = useMemo(
    () => `${SWAPI_PEOPLE_URL}/?page=${apiPage}`,
    [apiPage],
  );

  const { data, loading, error } = useApi<SwapiPeopleResponse>({
    endpoint,
    method: "GET",
  });

  const people = (data?.results ?? []) as SwapiPerson[];
  const totalCount = data?.count ?? 0;
  const totalApiPages = Math.max(1, Math.ceil(totalCount / SWAPI_PAGE_SIZE));

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
        People from{" "}
        <a href={SWAPI_PEOPLE_URL} style={{ color: "inherit" }}>
          SWAPI
        </a>{" "}
        — one person per step
      </p>

      {loading && <p style={{ fontSize: "0.875rem" }}>Loading&hellip;</p>}

      {error && (
        <p style={{ color: "#b00020", fontSize: "0.875rem" }}>
          {error.message}
        </p>
      )}

      {!loading && !error && people.length > 0 && (
        <StepperForm<SwapiPerson>
          fieldDefs={PERSON_FIELDS}
          rowData={people}
          validationSchema={personValidationSchema}
          onSubmit={(allRows) => {
            console.log("Submitted all rows:", allRows);
          }}
        />
      )}

      {/* API-level pagination — fully independent of the form */}
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

      {!loading && !error && people.length === 0 && (
        <p style={{ fontSize: "0.875rem", color: "#666" }}>No people found.</p>
      )}
    </main>
  );
}
