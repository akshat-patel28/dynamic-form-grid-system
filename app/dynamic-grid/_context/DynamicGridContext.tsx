"use client";

/**
 * @fileoverview Route-scoped context for `/dynamic-grid`.
 *
 * Holds UI state shared between the grid page and any nested routes
 * (e.g. `/dynamic-grid/edit`). Mounted via `app/dynamic-grid/layout.tsx`,
 * so it is NOT available outside this route subtree.
 */

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { EmployeeRow } from "@/helpers/mock/gridDemoData";

type DynamicGridContextValue = {
  /** Rows currently selected in the grid. Empty by default. */
  selectedRows: EmployeeRow[];
  /** Replace the full selection snapshot (supports updater fn like `setState`). */
  setSelectedRows: Dispatch<SetStateAction<EmployeeRow[]>>;
  /** Convenience: clear the current selection. */
  clearSelectedRows: () => void;
};

/**
 * Route-scoped React context for `/dynamic-grid`.
 *
 * Consume with `useContext(DynamicGridContext)` from within the
 * `/dynamic-grid` route subtree (provider is mounted in `layout.tsx`).
 * Will be `null` if read outside the provider.
 */
export const DynamicGridContext = createContext<DynamicGridContextValue>({
  selectedRows: [],
  setSelectedRows: () => {},
  clearSelectedRows: () => {},
});

type DynamicGridProviderProps = Readonly<{
  children: ReactNode;
}>;

export function DynamicGridProvider({ children }: DynamicGridProviderProps) {
  const [selectedRows, setSelectedRows] = useState<EmployeeRow[]>([]);

  const clearSelectedRows = useCallback(() => {
    setSelectedRows([]);
  }, []);

  const value = useMemo<DynamicGridContextValue>(
    () => ({ selectedRows, setSelectedRows, clearSelectedRows }),
    [selectedRows, clearSelectedRows],
  );

  return (
    <DynamicGridContext.Provider value={value}>
      {children}
    </DynamicGridContext.Provider>
  );
}
