"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { isAnalystStatus } from "@/entities/incident";
import {
  advancedFilters,
  buildIncidentFilters,
  emptyFilterValues,
  type FilterKey,
  type FilterValues,
  type IncidentFilterParams,
} from "../model/filters";

function FilterField({
  name,
  label,
  value,
  onChange,
  type = "text",
  options,
}: {
  name: FilterKey;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: "text" | "number" | "datetime-local";
  options?: Array<{ value: string; label: string }>;
}) {
  const controlClass =
    "h-8 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

  return (
    <label className="grid min-w-0 gap-1 text-xs font-medium text-gray-700">
      {label}
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={controlClass}
        >
          <option value="">Любое значение</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="h-8 text-sm"
        />
      )}
    </label>
  );
}

type Props = {
  isPending: boolean;
  activeFilterCount: number;
  onApply: (filters: IncidentFilterParams) => void;
  onClear: () => void;
};

// Форма фильтров: черновик значений хранится здесь, применённые фильтры — у владельца списка
export function IncidentsFilter({
  isPending,
  activeFilterCount,
  onApply,
  onClear,
}: Props) {
  const [filterValues, setFilterValues] =
    useState<FilterValues>(emptyFilterValues);
  const hasDraftFilters = Object.values(filterValues).some(Boolean);

  const handleFilterChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    if (name === "analyst_status") {
      setFilterValues((current) => ({
        ...current,
        analyst_status: isAnalystStatus(value) ? value : "",
      }));
      return;
    }
    setFilterValues((current) => ({ ...current, [name]: value }));
  };

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(buildIncidentFilters(filterValues));
  };

  const handleClearFilters = () => {
    setFilterValues(emptyFilterValues);
    onClear();
  };

  return (
    <form
      onSubmit={handleApplyFilters}
      className="mb-5 rounded-lg border border-gray-200 bg-white p-4"
    >
      <div className="flex flex-col items-end gap-3 sm:flex-row">
        <div className="w-full flex-1">
          <FilterField
            name="text"
            label="Поиск по инцидентам"
            value={filterValues.text}
            onChange={handleFilterChange}
          />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button type="submit" disabled={isPending}>
            <Search /> Применить
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            disabled={activeFilterCount === 0 && !hasDraftFilters}
            aria-label="Сбросить все фильтры"
            title="Сбросить все фильтры"
          >
            <RotateCcw />
            <span className="sm:hidden">Сброс</span>
          </Button>
        </div>
      </div>

      <details className="group mt-4 border-t border-gray-100 pt-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-gray-700 marker:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Дополнительные фильтры
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {activeFilterCount}
            </span>
          )}
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {advancedFilters.map((filter) => (
            <FilterField
              key={filter.name}
              {...filter}
              value={filterValues[filter.name]}
              onChange={handleFilterChange}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            <Search /> Применить фильтры
          </Button>
        </div>
      </details>
    </form>
  );
}
