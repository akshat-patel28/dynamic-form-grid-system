export type PageRouteMap = {
  HOME: "/";
  DYNAMIC_GRID: "/dynamic-grid";
  DYNAMIC_FORM: "/dynamic-form";
};

export type PageRoute = PageRouteMap[keyof PageRouteMap];

export type NavLink = {
  href: PageRoute;
  label: string;
};
