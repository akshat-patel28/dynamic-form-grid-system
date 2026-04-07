import type { NavLink, PageRouteMap } from "@/helpers/types/types";

export const PAGE_ROUTE: PageRouteMap = {
  HOME: "/",
  DYNAMIC_GRID: "/dynamic-grid",
  DYNAMIC_FORM: "/dynamic-form",
};

export const NAV_LINKS: readonly NavLink[] = [
  { href: PAGE_ROUTE.DYNAMIC_GRID, label: "Go to Dynamic Grid" },
  { href: PAGE_ROUTE.DYNAMIC_FORM, label: "Go to Dynamic Form" },
];
