"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, Search } from "lucide-react";
import {
  dateInputToIso,
  isoToDateInput,
  type IncidentFilterParams,
} from "../model/filters";

type Props = {
  filters: IncidentFilterParams;
  onChange: (filters: IncidentFilterParams) => void;
};

const dateInputClass =
  "w-[7.5rem] bg-transparent text-sm text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden";

// Период «с — по» и кнопка «Найти»
export function IncidentsDateRange({ filters, onChange }: Props) {
  const [from, setFrom] = useState(isoToDateInput(filters.from_time));
  const [to, setTo] = useState(isoToDateInput(filters.to_time));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = { ...filters };
    delete next.from_time;
    delete next.to_time;
    const fromTime = dateInputToIso(from, "start");
    const toTime = dateInputToIso(to, "end");
    if (fromTime) next.from_time = fromTime;
    if (toTime) next.to_time = toTime;
    onChange(next);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
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
