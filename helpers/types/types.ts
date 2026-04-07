export type PageRouteMap = {
  HOME: "/";
  DYNAMIC_GRID: "/dynamic-grid";
  DINAMIC_FORM: "/dinamic-form";
};

export type PageRoute = PageRouteMap[keyof PageRouteMap];

export type NavLink = {
  href: PageRoute;
  label: string;
};
