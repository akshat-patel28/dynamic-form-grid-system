import type { CommentFormRow, JsonPlaceholderComment } from "@/helpers/types/types";

/**
 * `YYYY-MM-DD` for the user's local calendar day (e.g. compare with date inputs).
 */
export const todayDateStringLocal = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Maps API comments to form rows: adds `rating` and `createdAt`.
 */
export function transformComments(
  rows: JsonPlaceholderComment[],
): CommentFormRow[] {
  const createdAt = new Date().toISOString().slice(0, 10);
  return rows.map((row) => ({
    ...row,
    rating: Math.floor(Math.random() * 5) + 1,
    createdAt,
    category: "general",
    featured: false,
    priority: "medium",
    verified: true,
  }));
}
