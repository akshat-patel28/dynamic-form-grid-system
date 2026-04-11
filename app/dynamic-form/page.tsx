"use client";

import Link from "next/link";
import { PAGE_ROUTE } from "@/helpers/constant/constant";
import { useApi } from "@/helpers/hooks/useApi";

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
  const { data, loading, error } = useApi<SwapiPeopleResponse>({
    endpoint: SWAPI_PEOPLE_URL,
    method: "GET",
  });

  const people = data?.results ?? [];

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
    </main>
  );
}
