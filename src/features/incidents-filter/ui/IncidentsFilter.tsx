"use client";

import { useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  getActiveChips,
  removeFilter,
  type IncidentFilterParams,
} from "../model/filters";
import { AddFilterMenu } from "./AddFilterMenu";

type Props = {
  filters: IncidentFilterParams;
  onChange: (filters: IncidentFilterParams) => void;
};

// Строка поиска, меню «Добавить фильтр» и чипы применённых фильтров
export function IncidentsFilter({ filters, onChange }: Props) {
  const [text, setText] = useState(filters.text ?? "");
  const chips = getActiveChips(filters);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = text.trim();
    onChange(
      value ? { ...filters, text: value } : removeFilter(filters, "text"),
    );
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center gap-3">
        <form
          onSubmit={handleSearch}
          role="search"
          className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 focus-within:border-brand-light"
        >
          <Search className="size-[18px] shrink-0 text-ink-muted" />
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Поиск по IP, source_ip, destination_ip, хосту, пользователю"
            aria-label="Поиск по инцидентам"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </form>
        <AddFilterMenu filters={filters} onChange={onChange} />
      </div>

      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {chips.map(({ field, value }) => (
            <li
              key={field.name}
              className="flex items-center gap-2 rounded-full border border-line bg-white px-2.5 py-1.5 text-[13px]"
            >
              <span>
                <span className="text-[#223952]">{field.label}</span>
                <span className="text-ink">: </span>
                <span className={cn("text-[#0965c5]", field.valueClassName)}>
                  {value}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onChange(removeFilter(filters, field.name))}
                aria-label={`Убрать фильтр «${field.label}»`}
                className="text-ink-muted transition-colors hover:text-ink"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
