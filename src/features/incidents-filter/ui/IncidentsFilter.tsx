"use client";

import { AddFilterMenu, FilterChips, FilterSearch } from "@/shared/ui/filter-bar";
import {
  applyFilterValue,
  filterFields,
  getActiveChips,
  removeFilter,
  type IncidentFilterParams,
} from "../model/filters";

type Props = {
  filters: IncidentFilterParams;
  onChange: (filters: IncidentFilterParams) => void;
};

// Строка поиска, меню «Добавить фильтр» и чипы применённых фильтров
export function IncidentsFilter({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <FilterSearch
          value={filters.text ?? ""}
          placeholder="Поиск по IP, source_ip, destination_ip, хосту, пользователю"
          label="Поиск по инцидентам"
          onSubmit={(text) =>
            onChange(text ? { ...filters, text } : removeFilter(filters, "text"))
          }
        />
        <AddFilterMenu
          fields={filterFields}
          getValue={(name) =>
            filters[name] === undefined ? "" : String(filters[name])
          }
          onApply={(name, value) => {
            const next = applyFilterValue(filters, name, value);
            if (next) onChange(next);
            return next !== null;
          }}
        />
      </div>

      <FilterChips
        chips={getActiveChips(filters)}
        onRemove={(name) => onChange(removeFilter(filters, name))}
      />
    </div>
  );
}
