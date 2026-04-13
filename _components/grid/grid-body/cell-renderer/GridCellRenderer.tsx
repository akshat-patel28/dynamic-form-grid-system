"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
const DropdownInput = dynamic(() => import("../../../inputs/DropdownInput"), {
  ssr: false,
});
const SwitchInput = dynamic(() => import("../../../inputs/SwitchInput"), {
  ssr: false,
});
const TextInput = dynamic(() => import("../../../inputs/TextInput"), {
  ssr: false,
});
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
 * Whether the draft value should be considered unchanged vs the committed cell value.
 * Compares raw row data (not formatted display); normalizes number vs numeric string for inputs.
 */
function valuesEqualForCellCommit(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a === null || a === undefined) {
    return (
      b === null ||
      b === undefined ||
      (typeof b === "string" && b.trim() === "")
    );
  }
  if (b === null || b === undefined) {
    return typeof a === "string" && a.trim() === "";
  }
  if (typeof a === "number" && typeof b === "string") {
    const n = Number(b);
    return !Number.isNaN(n) && n === a;
  }
  if (typeof b === "number" && typeof a === "string") {
    const n = Number(a);
    return !Number.isNaN(n) && n === b;
  }
  return false;
}

function valuesDifferForCellCommit(a: unknown, b: unknown): boolean {
  return !valuesEqualForCellCommit(a, b);
}

function runCellValidation<TData extends Record<string, unknown>>(
  columnDef: ColumnDef<TData>,
  value: unknown,
  rowData: TData,
  rowIndex: number,
): string | null {
  const fn = columnDef.validateCellValue;
  if (!fn) return null;
  const msg = fn({
    value,
    rowData,
    field: columnDef.field,
    rowIndex,
  });
  return msg && msg.trim() !== "" ? msg : null;
}

/**
 * GridCellRenderer
 *
 * Renders a single focusable data cell (`role="cell"`) with the formatted display value.
 * Display text comes from the module-local `resolveCellValue` function. Used by `GridBody`
 * and `GridFooter` for every non-checkbox column.
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
 * **blur** commits via `onCellValueChange` if the value changed (compared to raw
 * `row[field]`, not the formatted display string); **Escape** closes the editor
 * without committing. Date values use `YYYY-MM-DD` strings.
 *
 * When `columnDef.validateCellValue` is set, invalid drafts show a red outline on
 * text-like inputs; a failed commit shows `toast.error`, reverts to the committed
 * value, and does not call `onCellValueChange`.
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
  const [draftError, setDraftError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const textFieldError =
    Boolean(columnDef.validateCellValue) && Boolean(draftError);

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
      const committed = row[columnDef.field];
      setEditValue(committed);
      setDraftError(
        columnDef.validateCellValue
          ? runCellValidation(columnDef, committed, row, rowIndex)
          : null,
      );
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [
    isEditable,
    columnDef,
    row,
    rowIndex,
  ]);

  const commitValue = useCallback(() => {
    const committed = row[columnDef.field];

    if (columnDef.validateCellValue) {
      const msg = runCellValidation(columnDef, editValue, row, rowIndex);
      if (msg) {
        toast.error(msg);
        setEditValue(committed);
        setDraftError(null);
        setIsEditing(false);
        return;
      }
    }

    if (!valuesDifferForCellCommit(committed, editValue)) {
      setDraftError(null);
      setIsEditing(false);
      return;
    }

    onCellValueChange(rowIndex, columnDef.field, editValue);
    setDraftError(null);
    setIsEditing(false);
  }, [
    columnDef,
    editValue,
    onCellValueChange,
    row,
    rowIndex,
  ]);

  const handleInputBlur = useCallback(() => {
    commitValue();
  }, [commitValue]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        commitValue();
      } else if (e.key === "Escape") {
        setEditValue(row[columnDef.field]);
        setDraftError(null);
        setIsEditing(false);
      }
    },
    [commitValue, row, columnDef.field],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setEditValue(next);
      if (columnDef.validateCellValue) {
        setDraftError(runCellValidation(columnDef, next, row, rowIndex));
      }
    },
    [columnDef, row, rowIndex],
  );

  const handleSwitchToggle = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      if (columnDef.validateCellValue) {
        const msg = runCellValidation(columnDef, checked, row, rowIndex);
        if (msg) {
          toast.error(msg);
          return;
        }
      }
      onCellValueChange(rowIndex, columnDef.field, checked);
    },
    [columnDef, onCellValueChange, row, rowIndex],
  );

  const handleDropdownChange = useCallback(
    (e: { target: { value: unknown } }) => {
      const val = e.target.value;
      if (columnDef.validateCellValue) {
        const msg = runCellValidation(columnDef, val, row, rowIndex);
        if (msg) {
          toast.error(msg);
          setEditValue(row[columnDef.field]);
          setDraftError(null);
          setIsEditing(false);
          return;
        }
      }
      setEditValue(val);
      onCellValueChange(rowIndex, columnDef.field, val);
      setIsEditing(false);
    },
    [columnDef, onCellValueChange, row, rowIndex],
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
          error={textFieldError}
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
          error={textFieldError}
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
          error={textFieldError}
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
          error={textFieldError}
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
          error={textFieldError}
          size="small"
          variant="outlined"
          className={styles.cellInput}
          slotProps={inputSlotProps}
          sx={inputSx}
        />
      ),
      [CELL_INPUT_RENDERERS.SWITCH_INPUT]: () => (
        <SwitchInput
          checked={!!row[columnDef.field]}
          onChange={handleSwitchToggle}
          size="small"
        />
      ),
      [CELL_INPUT_RENDERERS.DROPDOWN_INPUT]: () => (
        <DropdownInput
          value={editValue ?? ""}
          onChange={handleDropdownChange}
          onClose={() => setIsEditing(false)}
          options={columnDef.cellInputOptions ?? []}
          size="small"
          open
          className={styles.cellInput}
          sx={inputSx}
        />
      ),
    }),
    [
      columnDef.field,
      editValue,
      row,
      textFieldError,
      handleInputChange,
      handleInputBlur,
      handleInputKeyDown,
      handleSwitchToggle,
      handleDropdownChange,
      columnDef.cellInputOptions,
      inputSlotProps,
      inputSx,
    ],
  );

  const isAlwaysVisible =
    columnDef.cellInputRenderer === CELL_INPUT_RENDERERS.SWITCH_INPUT;

  const cellContent = useMemo(() => {
    if (isAlwaysVisible && isEditable && columnDef.cellInputRenderer) {
      const renderInput = cellInputMap[columnDef.cellInputRenderer];
      if (renderInput) return renderInput();
    }
    if (isEditing && columnDef.cellInputRenderer) {
      const renderInput = cellInputMap[columnDef.cellInputRenderer];
      if (renderInput) return renderInput();
    }
    return <span className={styles.bodyCellText}>{displayValue}</span>;
  }, [
    isAlwaysVisible,
    isEditable,
    isEditing,
    columnDef.cellInputRenderer,
    cellInputMap,
    displayValue,
  ]);

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
