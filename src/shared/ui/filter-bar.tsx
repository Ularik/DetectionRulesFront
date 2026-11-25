"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, ChevronLeft, CircleDashed, Plus, Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { dateInputToIso, formatPeriod, isoToDateInput } from "@/shared/lib/period";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";

// Панель фильтров списков по макету CERT-KG SIEM: поиск, «Добавить фильтр», чипы применённых фильтров

export type FilterBarField<Name extends string = string> = {
  name: Name;
  label: string;
  type?: "text" | "number";
  options?: Array<{ value: string; label: string }>;
  /** Цвет значения в чипе активного фильтра */
  valueClassName?: string;
};

export type FilterBarChip<Name extends string = string> = {
  field: FilterBarField<Name>;
  value: string;
};

const controlClass =
  "h-9 w-full rounded-lg border border-brand-soft bg-white px-2.5 text-sm text-ink outline-none focus:border-brand-light";

// Сначала выбирается поле, затем вводится значение. onApply возвращает false, если значение некорректно
export function AddFilterMenu<Name extends string>({
  fields,
  getValue,
  onApply,
}: {
  fields: FilterBarField<Name>[];
  getValue: (name: Name) => string;
  onApply: (name: Name, value: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<FilterBarField<Name> | null>(null);
  const [value, setValue] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setField(null);
      setValue("");
      setIsInvalid(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!field) return;
    if (!onApply(field.name, value)) {
      setIsInvalid(true);
      return;
    }
    handleOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-brand-soft bg-brand/10 px-3.5 text-sm text-brand-light transition-colors hover:font-semibold aria-expanded:font-semibold"
        >
          <Plus className="size-4" />
          Добавить фильтр
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-56 rounded-xl border-brand-soft bg-[#dbe4ed] p-2"
      >
        {field ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-1">
            <button
              type="button"
              onClick={() => {
                setField(null);
                setIsInvalid(false);
              }}
              className="flex items-center gap-1 self-start text-xs font-semibold text-brand-light"
            >
              <ChevronLeft className="size-3.5" />
              {field.label}
            </button>

            {field.options ? (
              <select
                autoFocus
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className={controlClass}
              >
                <option value="">Выберите значение</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                autoFocus
                type={field.type ?? "text"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                aria-invalid={isInvalid || undefined}
                className={controlClass}
              />
            )}

            {isInvalid && (
              <p className="text-xs text-red-600">Введите корректное значение</p>
            )}

            <button
              type="submit"
              className="h-9 rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-light"
            >
              Применить
            </button>
          </form>
        ) : (
          <ul className="flex max-h-80 flex-col overflow-y-auto">
            {fields.map((item) => (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => {
                    setField(item);
                    setValue(getValue(item.name));
                  }}
                  className="w-full rounded-md px-2 py-1 text-left text-xs text-black transition-colors hover:font-semibold hover:text-brand-light"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function FilterChips<Name extends string>({
  chips,
  onRemove,
}: {
  chips: FilterBarChip<Name>[];
  onRemove: (name: Name) => void;
}) {
  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map(({ field, value }) => (
        <li
          key={field.name}
          className="flex items-center gap-2 rounded-full border border-line bg-white px-2.5 py-1.5 text-[13px]"
        >
          <span>
            <span className="text-[#223952]">{field.label}</span>
            <span className="text-ink">: </span>
            <span className={cn("text-[#0965c5]", field.valueClassName)}>{value}</span>
          </span>
          <button
            type="button"
            onClick={() => onRemove(field.name)}
            aria-label={`Убрать фильтр «${field.label}»`}
            className="text-ink-muted transition-colors hover:text-ink"
          >
            <X className="size-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}

// Полнотекстовый поиск; пустая строка снимает фильтр
export function FilterSearch({
  value,
  placeholder,
  label,
  onSubmit,
}: {
  value: string;
  placeholder: string;
  label: string;
  onSubmit: (value: string) => void;
}) {
  const [text, setText] = useState(value);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(text.trim());
      }}
      role="search"
      className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 focus-within:border-brand-light"
    >
      <Search className="size-[18px] shrink-0 text-ink-muted" />
      <input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
      />
    </form>
  );
}

const dateInputClass =
  "w-[7.5rem] bg-transparent text-sm text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden";

// Период «с — по» и кнопка «Найти»; значения — ISO-строки начала и конца дня
export function DateRangeFilter({
  from: fromIso,
  to: toIso,
  onSubmit,
}: {
  from?: string;
  to?: string;
  onSubmit: (range: { from_time?: string; to_time?: string }) => void;
}) {
  const [from, setFrom] = useState(isoToDateInput(fromIso));
  const [to, setTo] = useState(isoToDateInput(toIso));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          from_time: dateInputToIso(from, "start"),
          to_time: dateInputToIso(to, "end"),
        });
      }}
      className="flex flex-wrap items-center gap-3"
    >
      <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2">
        <CalendarDays className="size-4 shrink-0 text-ink" />
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => setFrom(event.target.value)}
          aria-label="Начало периода"
          className={dateInputClass}
          onClick={(event) => event.currentTarget.showPicker?.()}
        />
        <span className="text-sm text-ink-muted">—</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => setTo(event.target.value)}
          aria-label="Конец периода"
          className={dateInputClass}
          onClick={(event) => event.currentTarget.showPicker?.()}
        />
      </div>
      <button
        type="submit"
        className="flex h-[38px] items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
      >
        <Search className="size-4" />
        Найти
      </button>
    </form>
  );
}

// «Сентябрь 2024 — Сентябрь 2026» слева над таблицей
export function PeriodBadge({ from, to }: { from?: string; to?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-ink">
      <CircleDashed className="size-6 text-[#0088ff]" />
      {formatPeriod(from, to)}
    </div>
  );
}
