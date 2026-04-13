# Dynamic Form & Grid System

A small [Next.js](https://nextjs.org) app built around a reusable, scrollable data **grid**: column definitions, row data, optional row selection, and demo pages for dynamic forms and grids.

## Prerequisites

- **Node.js** — Use an [Active LTS](https://nodejs.org/) version compatible with your Next.js release (this repo targets **Next.js 16**).
- **npm** — Comes with Node (or use another package manager if you align lockfiles accordingly).

## Local setup

From the project root, run the steps below.

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables (`.env`)

Configuration is driven by environment files in the project root. Git ignores local env files except `.env.example`, which documents the supported variables.

1. Copy the example file to a local env file Next.js will load (recommended: **`.env.local`**):

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` as needed. Variables must be prefixed with `NEXT_PUBLIC_` if they are read in browser code (see [Next.js: Environment variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)).

**Variables in this project**

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_JSONPLACEHOLDER_BASE_URL` | No | Base URL for the [JSONPlaceholder](https://jsonplaceholder.typicode.com/) API **without** a trailing slash. Used by the **Dynamic form** demo (`/dynamic-form`) to fetch paginated comments. If omitted, the app falls back to `https://jsonplaceholder.typicode.com`. |

Example (same as `.env.example`):

```bash
# Base URL for the JSONPlaceholder API (no trailing slash).
NEXT_PUBLIC_JSONPLACEHOLDER_BASE_URL=https://jsonplaceholder.typicode.com
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo routes include `/dynamic-grid` and `/dynamic-form` (see `app/`).

### 4. Other useful commands

| Command | Purpose |
| ------- | ------- |
| `npm run build` | Production build |
| `npm run start` | Run the production server (after `build`) |
| `npm run lint` | ESLint |

## Third-party libraries

Runtime dependencies and what they are used for in this codebase:

| Package | Role |
| ------- | ---- |
| **next** | App framework: App Router, routing, `next/dynamic` for code-splitting inputs in the stepper/grid flows. |
| **react** / **react-dom** | UI rendering (client components for grid, forms, inputs). |
| **@mui/material** | Material Design UI primitives: layout, `TextField`, `Select`, `Pagination`, `DataGrid`-style building blocks used by shared inputs and pagination. |
| **@mui/icons-material** | Icon set (e.g. stepper first/prev/next/last controls). |
| **@emotion/react** / **@emotion/styled** | CSS-in-JS runtime required by MUI v5+. |
| **formik** | Form state for **StepperForm**: values, validation integration, submit handling. |
| **yup** | Schema validation passed into Formik (`validationSchema`) on demo pages and stepper types. |
| **axios** | HTTP client used by **`helpers/hooks/useApi.ts`** for API calls (e.g. JSONPlaceholder on the dynamic form page). |
| **react-toastify** | Toast notifications (e.g. feedback when copying cell content in the grid). |

**Development-only** dependencies (tooling; not shipped as application bundles):

| Package | Role |
| ------- | ---- |
| **typescript** | Static typing |
| **eslint** / **eslint-config-next** | Linting aligned with Next.js |
| **@types/node** / **@types/react** / **@types/react-dom** | TypeScript typings for Node and React |

## Folder structure (overview)

```text
app/                    # Next.js App Router: layouts, pages, global styles
  dynamic-grid/         # Grid demo page
  dynamic-form/         # Dynamic form demo page

_components/grid/       # Grid feature module (public API via index.ts)
  Grid.tsx              # Composes header + body
  grid-body/            # Body rows, cells, keyboard copy, selection UI
  grid-header/          # Sticky header row
  helpers/              # hooks/, utils/, types/ used only by the grid

helpers/                # Shared app helpers (types, utils, mocks, constants)
```

Internal grid imports are kept under `_components/grid/`; pages and demos can import the grid from `@/_components/grid` (or the path alias your `tsconfig` defines).
