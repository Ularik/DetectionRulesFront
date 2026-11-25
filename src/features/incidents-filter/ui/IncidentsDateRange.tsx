"use client";

import { DateRangeFilter } from "@/shared/ui/filter-bar";
import type { IncidentFilterParams } from "../model/filters";

type Props = {
  filters: IncidentFilterParams;
  onChange: (filters: IncidentFilterParams) => void;
};

// Период «с — по» и кнопка «Найти»
export function IncidentsDateRange({ filters, onChange }: Props) {
  return (
    <DateRangeFilter
      from={filters.from_time}
      to={filters.to_time}
      onSubmit={({ from_time, to_time }) => {
        const next = { ...filters, from_time, to_time };
        if (!from_time) delete next.from_time;
        if (!to_time) delete next.to_time;
        onChange(next);
      }}
    />
  );
}
