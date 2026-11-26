"use client";

import { AddFilterMenu, FilterChips, FilterSearch } from "@/shared/ui/filter-bar";
import {
  applyEventFilterValue,
  eventFilterFields,
  getEventChips,
  removeEventFilter,
  type EventFilterParams,
} from "../model/filters";

type Props = {
  filters: EventFilterParams;
  onChange: (filters: EventFilterParams) => void;
};

// Поиск, «Добавить фильтр» и чипы применённых фильтров (макет CERT-KG SIEM, Raw data)
export function EventsFilter({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <FilterSearch
          value={filters.text ?? ""}
          placeholder="Поиск по IP, source_ip, destination_ip ..."
          label="Поиск по событиям"
          onSubmit={(text) =>
            onChange(text ? { ...filters, text } : removeEventFilter(filters, "text"))
          }
        />
        <AddFilterMenu
          fields={eventFilterFields}
          getValue={(name) => filters[name] ?? ""}
          onApply={(name, value) => {
            const next = applyEventFilterValue(filters, name, value);
            if (next) onChange(next);
            return next !== null;
          }}
        />
      </div>

      <FilterChips
        chips={getEventChips(filters)}
        onRemove={(name) => onChange(removeEventFilter(filters, name))}
      />
    </div>
  );
}
