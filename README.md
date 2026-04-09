# Dynamic form grid system

A small [Next.js](https://nextjs.org) app built around a reusable, scrollable data **grid**: column definitions, row data, optional row selection, and demo pages for dynamic forms and grids.

## Getting started

From the project root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo routes include `/dynamic-grid` and `/dynamic-form` (see `app/`).

Other scripts:

- `npm run build` — production build  
- `npm run start` — run the production server (after `build`)  
- `npm run lint` — ESLint  

## Dev libraries

These are the main **development** dependencies (tooling only; not shipped to the browser as app bundles):

| Package | Role |
| -------- | ---- |
| **TypeScript** (`typescript`) | Static typing |
| **ESLint** (`eslint`, `eslint-config-next`) | Linting aligned with Next.js |

Runtime-related types: `@types/node`, `@types/react`, `@types/react-dom`.

App dependencies (for reference): **Next.js**, **React**, **react-dom**, **react-toastify** (copy-to-clipboard toasts in the grid).

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
