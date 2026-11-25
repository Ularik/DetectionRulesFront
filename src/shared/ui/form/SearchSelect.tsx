"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { controlClass } from "./controls";

export interface SearchSelectOption {
  value: string;
  label: string;
  description?: string;
  /** Пометка справа (например, «отозвана») */
  hint?: string;
  /** Нельзя выбрать — показывается приглушённо */
  disabled?: boolean;
  /** Дополнительный текст для поиска (тактики, описание) */
  keywords?: string;
}

/** Больше строк не рисуем — длинные справочники (каталог MITRE) сужаются поиском */
const RENDER_LIMIT = 150;
/** Высота поля поиска + полного списка (max-h-64) — столько места под триггером хватает, чтобы открыть вниз */
const MIN_SPACE_BELOW = 320;

/** Всплывающий select с поиском по подписи и значению.
 * allowCustom — можно выбрать введённое значение, которого нет в справочнике */
export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = "Выберите значение",
  searchPlaceholder = "Поиск…",
  emptyText = "Ничего не найдено",
  allowCustom,
  invalid,
  disabled,
  loading,
  ariaLabel,
  trigger,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  /** Своя кнопка-триггер вместо поля (например, «+ Добавить шаг») */
  trigger?: ReactNode;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [side, setSide] = useState<"top" | "bottom">("bottom");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((option) => option.value === value);
  const trimmed = query.trim();

  const filtered = useMemo(() => {
    const needle = trimmed.toLowerCase();
    if (!needle) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        option.value.toLowerCase().includes(needle) ||
        Boolean(option.keywords?.toLowerCase().includes(needle)),
    );
  }, [options, trimmed]);

  const customValue =
    allowCustom && trimmed && !options.some((option) => option.value === trimmed) ? trimmed : null;
  const visible = filtered.slice(0, RENDER_LIMIT);
  const hiddenCount = filtered.length - visible.length;
  const items: SearchSelectOption[] = customValue
    ? [...visible, { value: customValue, label: `Использовать «${customValue}»` }]
    : visible;

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) {
      // Сторону выбираем один раз при открытии: иначе Radix перекидывает список вверх/вниз
      // при каждом изменении его высоты во время ввода, и поле поиска «прыгает»
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        setSide(spaceBelow >= MIN_SPACE_BELOW || spaceBelow >= rect.top ? "bottom" : "top");
      }
      setQuery("");
      const index = options.findIndex((option) => option.value === value);
      setActiveIndex(index >= 0 && index < RENDER_LIMIT ? index : 0);
    }
  };

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!items.length) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = (activeIndex + delta + items.length) % items.length;
      setActiveIndex(next);
      document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item && !item.disabled) pick(item.value);
    }
  };

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger ref={triggerRef} asChild disabled={disabled}>
        {trigger ?? (
          <button
            type="button"
            aria-label={ariaLabel}
            data-invalid={invalid || undefined}
            className={cn(
              controlClass,
              "flex cursor-pointer items-center gap-2 pr-2 text-left data-invalid:border-red-400",
            )}
          >
            <span className={cn("min-w-0 flex-1 truncate", !value && "text-ink-muted")}>
              {loading && !selected ? (
                "Загрузка…"
              ) : value ? (
                <>
                  {selected?.label ?? value}
                  {selected && selected.label !== value && (
                    <span className="ml-2 font-mono text-[11px] text-ink-muted">{value}</span>
                  )}
                </>
              ) : (
                placeholder
              )}
            </span>
            <ChevronDown aria-hidden className="size-4 shrink-0 text-ink-muted" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side={side}
        avoidCollisions={false}
        className={cn(
          "flex w-(--radix-popover-trigger-width) min-w-64 max-h-(--radix-popover-content-available-height) overflow-hidden p-0",
          // Над триггером поле поиска — снизу, рядом с кнопкой: при сужении списка оно остаётся на месте
          side === "top" ? "flex-col-reverse" : "flex-col",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center gap-2 border-line-muted px-3",
            side === "top" ? "border-t" : "border-b",
          )}
        >
          <Search aria-hidden className="size-4 shrink-0 text-ink-muted" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-activedescendant={items[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            className="h-10 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <ul id={listId} role="listbox" className="scrollbar-subtle max-h-64 min-h-0 overflow-y-auto p-1">
          {loading && !options.length && (
            <li className="px-3 py-2 text-[13px] text-ink-muted">Загрузка…</li>
          )}
          {!loading && !items.length && (
            <li className="px-3 py-2 text-[13px] text-ink-muted">{emptyText}</li>
          )}
          {items.map((item, index) => {
            const isSelected = item.value === value && item.value !== customValue;
            return (
              <li
                key={`${item.value}:${index}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={item.disabled || undefined}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => !item.disabled && pick(item.value)}
                className={cn(
                  "flex items-start gap-2 rounded-lg px-3 py-2 text-[13px]",
                  item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  index === activeIndex && !item.disabled ? "bg-surface-muted" : "",
                  item.value === customValue && "text-brand-light",
                )}
              >
                <Check
                  aria-hidden
                  className={cn("mt-0.5 size-4 shrink-0 text-brand-light", !isSelected && "invisible")}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-ink">{item.label}</span>
                  {item.value !== customValue && item.label !== item.value && (
                    <span className="truncate font-mono text-[11px] text-ink-muted">{item.value}</span>
                  )}
                  {item.description && (
                    <span className="line-clamp-2 text-[11px] text-ink-muted">{item.description}</span>
                  )}
                </span>
                {item.hint && (
                  <span className="shrink-0 rounded bg-gray-100 px-1.5 text-[10px] leading-4 text-gray-600">
                    {item.hint}
                  </span>
                )}
              </li>
            );
          })}
          {hiddenCount > 0 && (
            <li className="px-3 py-2 text-center text-[11px] text-ink-muted">
              Ещё {hiddenCount} — уточните поиск
            </li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
