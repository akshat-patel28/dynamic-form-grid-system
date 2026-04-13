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

/**
 * Shape of a single comment from JSONPlaceholder `GET /comments`.
 */
export type JsonPlaceholderComment = {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
};

/**
 * Shape of a single post from JSONPlaceholder `GET /posts`.
 */
export type JsonPlaceholderPost = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

/**
 * Row passed to the stepper after local transformation.
 */
export type CommentFormRow = JsonPlaceholderComment & {
  rating: number;
  /** ISO-8601 date (`YYYY-MM-DD`) from `new Date().toISOString().slice(0, 10)`. */
  createdAt: string;
  category: string;
  featured: boolean;
  priority: string;
  verified: boolean;
};
