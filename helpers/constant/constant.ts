import type { NavLink, PageRouteMap } from "@/helpers/types/types";

export const PAGE_ROUTE: PageRouteMap = {
  HOME: "/",
  DYNAMIC_GRID: "/dynamic-grid",
  DINAMIC_FORM: "/dinamic-form",
};

export const NAV_LINKS: readonly NavLink[] = [
  { href: PAGE_ROUTE.DYNAMIC_GRID, label: "Go to Dynamic Grid" },
  { href: PAGE_ROUTE.DINAMIC_FORM, label: "Go to Dinamic Form" },
];
