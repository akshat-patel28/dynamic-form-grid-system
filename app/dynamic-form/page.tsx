"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PAGE_ROUTE } from "@/helpers/constant/constant";
import { useApi } from "@/helpers/hooks/useApi";

/** SWAPI returns 10 people per page by default. */
const PEOPLE_PAGE_SIZE = 10;

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
};

type SwapiPeopleResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: SwapiPerson[];
};

const SWAPI_PEOPLE_URL = "https://swapi.dev/api/people";

export default function DynamicFormPage() {
  const [page, setPage] = useState(1);

  const endpoint = useMemo(
    () => `${SWAPI_PEOPLE_URL}/?page=${page}`,
    [page],
  );

  const { data, loading, error } = useApi<SwapiPeopleResponse>({
    endpoint,
    method: "GET",
  });

  const people = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PEOPLE_PAGE_SIZE));
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <main style={{ padding: "24px", maxWidth: "36rem" }}>
      <Link
        href={PAGE_ROUTE.HOME}
        style={{
          display: "inline-block",
          marginBottom: "12px",
          fontSize: "0.875rem",
        }}
      >
        ← Back
      </Link>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Dynamic Form</h1>
      <p style={{ color: "#555", marginBottom: "16px", fontSize: "0.9rem" }}>
        People from{" "}
        <a href={SWAPI_PEOPLE_URL} style={{ color: "inherit" }}>
          SWAPI
        </a>
      </p>

      {loading && <p style={{ fontSize: "0.875rem" }}>Loading…</p>}
      {error && (
        <p style={{ color: "#b00020", fontSize: "0.875rem" }}>
          {error.message}
        </p>
      )}

      {!loading && !error && people.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {people.map((person) => (
            <li
              key={person.url}
              style={{
                padding: "10px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                background: "#fafafa",
                fontSize: "0.875rem",
              }}
            >
              <strong>{person.name}</strong>
              <span style={{ color: "#666", marginLeft: "8px" }}>
                {person.gender} · b. {person.birth_year}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && people.length === 0 && (
        <p style={{ fontSize: "0.875rem", color: "#666" }}>No people found.</p>
      )}

      {data && !error && totalCount > 0 && (
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            fontSize: "0.875rem",
          }}
        >
          <button
            type="button"
            disabled={!canGoPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: canGoPrev && !loading ? "#fff" : "#f0f0f0",
              cursor: canGoPrev && !loading ? "pointer" : "not-allowed",
            }}
          >
            Previous
          </button>
          <span style={{ color: "#444" }}>
            Page {page} of {totalPages}
            <span style={{ color: "#888", marginLeft: "8px" }}>
              ({totalCount} total)
            </span>
          </span>
          <button
            type="button"
            disabled={!canGoNext || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: canGoNext && !loading ? "#fff" : "#f0f0f0",
              cursor: canGoNext && !loading ? "pointer" : "not-allowed",
            }}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
