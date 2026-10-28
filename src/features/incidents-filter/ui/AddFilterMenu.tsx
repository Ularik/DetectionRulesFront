"use client";

import { useState, type FormEvent } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Input } from "@/shared/ui/input";
import {
  applyFilterValue,
  filterFields,
  type FilterFieldConfig,
  type IncidentFilterParams,
} from "../model/filters";

type Props = {
  filters: IncidentFilterParams;
  onChange: (filters: IncidentFilterParams) => void;
};

const controlClass =
  "h-9 w-full rounded-lg border border-brand-soft bg-white px-2.5 text-sm text-ink outline-none focus:border-brand-light";

// «Добавить фильтр»: сначала выбирается поле, затем вводится значение
export function AddFilterMenu({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<FilterFieldConfig | null>(null);
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
    const nextFilters = applyFilterValue(filters, field.name, value);
    if (!nextFilters) {
      setIsInvalid(true);
      return;
    }
    onChange(nextFilters);
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
            {filterFields.map((item) => (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => {
                    setField(item);
                    setValue(
                      filters[item.name] === undefined
                        ? ""
                        : String(filters[item.name]),
                    );
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
