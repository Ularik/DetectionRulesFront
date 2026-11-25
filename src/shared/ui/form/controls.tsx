"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, Info, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Контролы правых панелей-форм (макеты «Правила обнаружения», «Правила корреляции»)

export const controlClass =
  "h-9 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-brand-light focus:ring-2 focus:ring-brand-light/20 disabled:bg-surface-muted disabled:text-ink-muted aria-invalid:border-red-400";

export const textareaClass = cn(controlClass, "h-auto min-h-[68px] py-2 leading-5");

export function Field({
  label,
  required,
  hint,
  error,
  counter,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  counter?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-xs font-semibold text-ink">
          {label}
          {required && <span className="text-red-500">*</span>}
          {hint && (
            <span title={hint} className="text-ink-muted">
              <Info className="size-3.5" aria-label={hint} />
            </span>
          )}
        </span>
        {counter && <span className="text-[11px] text-ink-muted">{counter}</span>}
      </div>
      {children}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

export function SelectBox({
  value,
  onChange,
  invalid,
  disabled,
  prefix,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  prefix?: ReactNode;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">{prefix}</span>
      )}
      <select
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className={cn(controlClass, "cursor-pointer appearance-none pr-8", prefix && "pl-7")}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-ink">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-brand-light" : "bg-gray-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-4",
          )}
        />
      </button>
      {label}
    </label>
  );
}

/** Список строк чипами: Enter, запятая или потеря фокуса добавляют значение */
export function ChipsInput({
  values,
  onChange,
  suggestions,
  placeholder,
  invalid,
  validate,
  mono,
  renderChip,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: readonly string[];
  placeholder?: string;
  invalid?: boolean;
  /** Вернуть текст ошибки, если значение нельзя добавить */
  validate?: (value: string) => string | null;
  mono?: boolean;
  renderChip?: (value: string) => ReactNode;
}) {
  const listId = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    const value = draft.trim().replace(/,$/, "").trim();
    if (!value) return;
    const problem = validate?.(value) ?? null;
    if (problem) {
      setError(problem);
      return;
    }
    if (!values.includes(value)) onChange([...values, value]);
    setDraft("");
    setError(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        aria-invalid={invalid || undefined}
        className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-white px-2 py-1.5 focus-within:border-brand-light focus-within:ring-2 focus-within:ring-brand-light/20 aria-invalid:border-red-400"
      >
        {values.map((value) => (
          <span
            key={value}
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-md border border-[#d9ebfc] bg-[#f2f9ff] px-2 py-0.5 text-xs text-[#0965c5]",
              mono && "font-mono",
            )}
          >
            <span className="truncate">{renderChip ? renderChip(value) : value}</span>
            <button
              type="button"
              aria-label={`Убрать ${value}`}
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="shrink-0 hover:text-brand"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          list={suggestions ? listId : undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={values.length ? undefined : placeholder}
          className={cn(
            "h-6 min-w-[120px] flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted",
            mono && "font-mono",
          )}
        />
        {suggestions && (
          <datalist id={listId}>
            {suggestions
              .filter((item) => !values.includes(item))
              .map((item) => (
                <option key={item} value={item} />
              ))}
          </datalist>
        )}
      </div>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
