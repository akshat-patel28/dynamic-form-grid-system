import type { ReactNode } from "react";
import { DynamicGridProvider } from "./_context/DynamicGridContext";

/**
 * Layout for the `/dynamic-grid` route subtree.
 *
 * Wraps every nested page (including `/dynamic-grid/edit`) with
 * `DynamicGridProvider` so selection state is shared only within
 * this route tree.
 */
export default function DynamicGridLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <DynamicGridProvider>{children}</DynamicGridProvider>;
}
