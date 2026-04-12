import type { CommentFormRow, JsonPlaceholderComment } from "@/helpers/types/types";

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
  }));
}
