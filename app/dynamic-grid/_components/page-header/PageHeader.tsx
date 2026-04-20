"use client";

import Link from "next/link";
import styles from "./PageHeader.module.css";
import { PAGE_ROUTE } from "@/helpers/constant/constant";

interface PageHeaderProps {
  /**
   * Whether at least one checkbox row is currently selected in the grid.
   *
   * Used to control the disabled state and visual style of the
   * "Show selected" CTA.
   */
  hasSelection: boolean;
  /**
   * Click handler for the "Show selected" button.
   *
   * Parent typically reads selected rows via `gridRef.current?.getSelectedRows()`
   * and triggers any top-level action (toast, delete, export, etc.).
   */
  onShowSelected: () => void;
}

/**
 * Header section for the Dynamic Grid page.
 *
 * Renders:
 * - Back navigation link.
 * - Page title.
 * - "Show selected" action button that is enabled only when `hasSelection` is `true`.
 *
 * This component intentionally stays stateless; selection ownership remains in
 * the page component and is driven by `<Grid onSelectionChanged={...} />`.
 *
 * @param props - {@link PageHeaderProps}
 * @returns Header UI displayed above the grid and loader.
 */
export default function PageHeader({
  hasSelection,
  onShowSelected,
}: Readonly<PageHeaderProps>) {
  return (
    <>
      <Link
        href={PAGE_ROUTE.HOME}
        style={{
          display: "inline-block",
          marginBottom: "16px",
          fontSize: "0.875rem",
        }}
      >
        ← Back
      </Link>

      <div className={styles.headerRow}>
        <h1 className={styles.title}>Dynamic Grid</h1>
        <button
          type="button"
          onClick={onShowSelected}
          disabled={!hasSelection}
          className={
            hasSelection
              ? styles.showSelectedButton
              : `${styles.showSelectedButton} ${styles.showSelectedButtonDisabled}`
          }
        >
          Show selected
        </button>
      </div>
    </>
  );
}
