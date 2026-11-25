"use client";

import { AddFilterMenu, FilterChips, FilterSearch } from "@/shared/ui/filter-bar";
import {
  applyScenarioFilterValue,
  getScenarioChips,
  removeScenarioFilter,
  scenarioFilterFields,
  type ScenarioFilterParams,
} from "../model/filters";

type Props = {
  filters: ScenarioFilterParams;
  onChange: (filters: ScenarioFilterParams) => void;
};

// Поиск, «Добавить фильтр» и чипы применённых фильтров (макет CERT-KG SIEM, раздел «Сценарии»)
export function ScenariosFilter({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <FilterSearch
          value={filters.text ?? ""}
          placeholder="Поиск по ID сценария, IP, Host, User, типу атаки, Asset..."
          label="Поиск по сценариям"
          onSubmit={(text) =>
            onChange(text ? { ...filters, text } : removeScenarioFilter(filters, "text"))
          }
        />
        <AddFilterMenu
          fields={scenarioFilterFields}
          getValue={(name) => {
            const value = filters[name];
            return value === undefined || value === null ? "" : String(value);
          }}
          onApply={(name, value) => {
            const next = applyScenarioFilterValue(filters, name, value);
            if (next) onChange(next);
            return next !== null;
          }}
        />
      </div>

      <FilterChips
        chips={getScenarioChips(filters)}
        onRemove={(name) => onChange(removeScenarioFilter(filters, name))}
      />
    </div>
  );
}
