"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import TextInput from "../../../inputs/TextInput";
import { CELL_INPUT_RENDERERS } from "../../helpers/constants/cellInputRenderers";
import type { CellInputRenderer } from "../../helpers/constants/cellInputRenderers";
import type {
  ColumnDef,
  GridCellRendererProps,
} from "../../helpers/types/types";
import styles from "../../grid.module.css";

/**
 * Resolves the display string for a cell.
 *
 * Resolution order:
 * 1. `col.valueFormatter({ rowData })` — when a formatter is defined on the column.
 * 2. `''` — when the raw value is `null` or `undefined`.
 * 3. `String(rawValue)` — fallback coercion for all other values.
 *
 * @param col - The column definition for the cell being rendered.
 * @param row - The full row data object the cell belongs to.
 * @returns The string to display inside the cell.
 */
function resolveCellValue<TData extends Record<string, unknown>>(
  col: ColumnDef<TData>,
  row: TData,
): string {
  if (col.valueFormatter) return col.valueFormatter({ rowData: row });
  const raw = row[col.field];
  return raw === null || raw === undefined ? "" : String(raw);
}

/**
 * GridCellRenderer
 *
 * Renders a single focusable data cell (`role="cell"`) with the formatted display value.
 * Display text comes from {@link resolveCellValue}. Used by {@link GridBody} for columns
 * that are not checkbox selection columns.
 *
 * ### Clipboard
 * **Ctrl+C** / **Cmd+C** copies the resolved display string to the clipboard and shows
 * a short success toast (via `react-toastify`).
 *
 * ### Focus highlight
 * When `focusedCell` matches this cell’s indices, the wrapper
 * gets `bodyCellFocused` plus base and column-specific classes.
 *
 * ### Inline editing
 * When the column is editable (`editable` is `true` or the row-level predicate
 * returns `true`) and `cellInputRenderer` is set, **double-click** opens the
 * mapped input (text, number, email, or native `type="date"`). **Enter** or
 * **blur** commits via `onCellValueChange` if the value changed; **Escape**
 * closes the editor without committing. Date values use `YYYY-MM-DD` strings.
 *
 * @param props - {@link GridCellRendererProps}
 * @returns A cell `<div>` with either formatted text or the active inline input.
 */
export default function GridCellRenderer<
  TData extends Record<string, unknown>,
>({
  columnDef,
  row,
  focusedCell,
  cellStyle,
  rowIndex,
  colIndex,
  onFocus,
  onBlur,
  onCellValueChange,
}: GridCellRendererProps<TData>) {
  const displayValue = resolveCellValue(columnDef, row);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(row[columnDef.field]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFocused =
    focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex;

  const cellClass = [
    styles.bodyCell,
    isFocused ? styles.bodyCellFocused : "",
    columnDef.cellClass ?? "",
    columnDef.bodyCellClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  /**
   * Returns a `keydown` handler for a cell that copies the cell's display
   * value to the clipboard when the user presses Ctrl+C / Cmd+C.
   */
  const handleCellKeyDown = useCallback(
    (value: string) => (event: React.KeyboardEvent<HTMLDivElement>) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        event.stopPropagation();
        void navigator.clipboard.writeText(value);
        toast.success("Cell value copied");
      }
    },
    [],
  );

  /** Resolve whether the column is editable for this row. */
  const isEditable =
    typeof columnDef.editable === "function"
      ? columnDef.editable({ rowData: row })
      : !!columnDef.editable;

  const handleDoubleClick = useCallback(() => {
    if (isEditable && columnDef.cellInputRenderer) {
      setEditValue(row[columnDef.field]);
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditable, columnDef.cellInputRenderer, row, columnDef.field]);

  const commitValue = useCallback(() => {
    if (editValue !== displayValue) {
      onCellValueChange(rowIndex, columnDef.field, editValue);
    }
    setIsEditing(false);
  }, [editValue, displayValue, onCellValueChange, rowIndex, columnDef.field]);

  const handleInputBlur = useCallback(() => {
    commitValue();
  }, [commitValue]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        commitValue();
      } else if (e.key === "Escape") {
        setIsEditing(false);
      }
    },
    [commitValue],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    },
    [],
  );

  /** Shared MUI sx props reused by every TextInput variant. */
  const inputSx = useMemo(
    () => ({
      height: "100%",
      "& .MuiOutlinedInput-root": { height: "100%" },
    }),
    [],
  );

  const inputSlotProps = useMemo(
    () => ({
      input: {
        sx: { height: "100%", padding: 0, fontSize: "14px" },
      },
    }),
    [],
  );

  /** Map of cellInputRenderer values → JSX factory for that input type. */
  const cellInputMap = useMemo<
    Partial<Record<CellInputRenderer, () => React.ReactNode>>
  >(
    () => ({
      [CELL_INPUT_RENDERERS.TEXT_INPUT]: () => (
        <TextInput
          inputRef={inputRef}
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          size="small"
          variant="outlined"
          className={styles.cellInput}
          slotProps={inputSlotProps}
          sx={inputSx}
        />
      ),
      [CELL_INPUT_RENDERERS.TEXTAREA_INPUT]: () => (
        <TextInput
          inputRef={inputRef}
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          size="small"
          variant="outlined"
          className={styles.cellInput}
          slotProps={inputSlotProps}
          sx={inputSx}
          multiline
          minRows={2}
        />
      ),
      [CELL_INPUT_RENDERERS.NUMBER_INPUT]: () => (
        <TextInput
          inputRef={inputRef}
          type="number"
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          size="small"
          variant="outlined"
          className={styles.cellInput}
          slotProps={inputSlotProps}
          sx={inputSx}
        />
      ),
      [CELL_INPUT_RENDERERS.EMAIL_INPUT]: () => (
        <TextInput
          inputRef={inputRef}
          type="email"
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          size="small"
          variant="outlined"
          className={styles.cellInput}
          slotProps={inputSlotProps}
          sx={inputSx}
        />
      ),
      [CELL_INPUT_RENDERERS.DATE_INPUT]: () => (
        <TextInput
          inputRef={inputRef}
          type="date"
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          size="small"
          variant="outlined"
          className={styles.cellInput}
          slotProps={inputSlotProps}
          sx={inputSx}
        />
      ),
    }),
    [
      editValue,
      handleInputChange,
      handleInputBlur,
      handleInputKeyDown,
      inputSlotProps,
      inputSx,
    ],
  );

  const cellContent = useMemo(() => {
    if (isEditing && columnDef.cellInputRenderer) {
      const renderInput = cellInputMap[columnDef.cellInputRenderer];
      if (renderInput) return renderInput();
    }
    return <span className={styles.bodyCellText}>{displayValue}</span>;
  }, [isEditing, columnDef.cellInputRenderer, cellInputMap, displayValue]);

  return (
    <div
      className={cellClass}
      style={cellStyle}
      role="cell"
      title={displayValue}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleCellKeyDown(displayValue)}
      onDoubleClick={handleDoubleClick}
    >
      {cellContent}
    </div>
  );
}
