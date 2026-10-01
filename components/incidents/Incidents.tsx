"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  RotateCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { PaginationControl } from "@/components/pagination/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIncidents } from "@/services/incident/incidentQueries";
import type { ANALYST_STATUS, IncidentParams } from "@/types/incidents";

type IncidentFilterParams = Omit<IncidentParams, "page" | "size">;
type FilterKey = keyof IncidentFilterParams;
type FilterValues = Omit<Record<FilterKey, string>, "analyst_status"> & {
  analyst_status: ANALYST_STATUS | "";
};

const analystStatuses = [
  "new",
  "in_review",
  "confirmed",
  "false_positive",
  "closed",
] as const satisfies readonly ANALYST_STATUS[];

function isAnalystStatus(value: string): value is ANALYST_STATUS {
  return analystStatuses.some((status) => status === value);
}

const emptyFilterValues: FilterValues = {
  organization_id: "",
  from_time: "",
  to_time: "",
  source_ip: "",
  destination_ip: "",
  host: "",
  user: "",
  attack_type: "",
  severity: "",
  analyst_status: "",
  decision: "",
  action: "",
  priority: "",
  suppressed: "",
  mitre_id: "",
  campaign_id: "",
  incident_id: "",
  risk_score_min: "",
  risk_score_max: "",
  detection_category: "",
  source_id: "",
  text: "",
};

const textFilterKeys = [
  "organization_id",
  "source_ip",
  "destination_ip",
  "host",
  "user",
  "attack_type",
  "severity",
  "decision",
  "action",
  "mitre_id",
  "campaign_id",
  "incident_id",
  "detection_category",
  "source_id",
  "text",
] as const satisfies readonly FilterKey[];

const advancedFilters: Array<{
  name: FilterKey;
  label: string;
  type?: "text" | "number" | "datetime-local";
  options?: Array<{ value: string; label: string }>;
}> = [
  { name: "incident_id", label: "ID инцидента" },
  { name: "organization_id", label: "Организация" },
  { name: "from_time", label: "Начало периода", type: "datetime-local" },
  { name: "to_time", label: "Конец периода", type: "datetime-local" },
  { name: "source_ip", label: "IP источника" },
  { name: "destination_ip", label: "IP назначения" },
  { name: "host", label: "Хост" },
  { name: "user", label: "Пользователь" },
  { name: "attack_type", label: "Тип атаки" },
  {
    name: "severity",
    label: "Критичность",
    options: [
      { value: "critical", label: "Критическая" },
      { value: "high", label: "Высокая" },
      { value: "medium", label: "Средняя" },
      { value: "low", label: "Низкая" },
    ],
  },
  {
    name: "analyst_status",
    label: "Статус аналитика",
    options: [
      { value: analystStatuses[0], label: "Новый" },
      { value: analystStatuses[1], label: "На проверке" },
      { value: analystStatuses[2], label: "Подтвержден" },
      { value: analystStatuses[3], label: "Ложное срабатывание" },
      { value: analystStatuses[4], label: "Закрыт" },
    ],
  },
  { name: "decision", label: "Решение" },
  {
    name: "action",
    label: "Действие",
    options: [
      { value: "monitor", label: "Мониторинг" },
      { value: "block", label: "Блокировка" },
      { value: "investigate", label: "Расследование" },
    ],
  },
  { name: "priority", label: "Приоритет", type: "number" },
  {
    name: "suppressed",
    label: "Подавление",
    options: [
      { value: "true", label: "Подавлен" },
      { value: "false", label: "Не подавлен" },
    ],
  },
  { name: "mitre_id", label: "MITRE ID" },
  { name: "campaign_id", label: "ID кампании" },
  { name: "risk_score_min", label: "Risk score от", type: "number" },
  { name: "risk_score_max", label: "Risk score до", type: "number" },
  { name: "detection_category", label: "Категория детекции" },
  { name: "source_id", label: "ID источника" },
];

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

const severityStyles: Record<string, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-sky-200 bg-sky-50 text-sky-700",
};

const statusLabels: Record<ANALYST_STATUS, string> = {
  new: "Новый",
  in_review: "На проверке",
  confirmed: "Подтвержден",
  false_positive: "Ложное срабатывание",
  closed: "Закрыт",
};

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function Incidents() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [filterValues, setFilterValues] =
    useState<FilterValues>(emptyFilterValues);
  const [activeFilters, setActiveFilters] = useState<IncidentFilterParams>({});
  const { data, isPending, error, refetch } = useIncidents({
    page,
    size,
    ...activeFilters,
  });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const activeFilterCount = Object.keys(activeFilters).length;
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
    const nextFilters: IncidentFilterParams = {};

    for (const key of textFilterKeys) {
      const value = filterValues[key].trim();
      if (value) nextFilters[key] = value;
    }

    if (isAnalystStatus(filterValues.analyst_status)) {
      nextFilters.analyst_status = filterValues.analyst_status;
    }

    for (const key of ["from_time", "to_time"] as const) {
      const value = filterValues[key];
      if (!value) continue;
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) nextFilters[key] = date.toISOString();
    }

    for (const key of [
      "priority",
      "risk_score_min",
      "risk_score_max",
    ] as const) {
      const value = filterValues[key];
      if (value === "") continue;
      const number = Number(value);
      if (Number.isFinite(number)) nextFilters[key] = number;
    }

    if (filterValues.suppressed !== "") {
      nextFilters.suppressed = filterValues.suppressed === "true";
    }

    setActiveFilters(nextFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterValues(emptyFilterValues);
    setActiveFilters({});
    setPage(1);
  };

  return (
    <section>
      <div className="mb-5 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Инциденты</h1>
        <p className="mt-1 text-sm text-gray-500">
          Обнаруженные события и результаты их анализа
        </p>
      </div>

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

      {error ? (
        <div className="space-y-3 py-16 text-center">
          <p className="font-semibold text-gray-900">
            Не удалось загрузить инциденты
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm text-gray-600">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Инцидент</th>
                    <th className="px-4 py-3">Начало</th>
                    <th className="px-4 py-3">Критичность</th>
                    <th className="px-4 py-3">Risk score</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3">Тип атаки</th>
                    <th className="px-4 py-3">Источник</th>
                    <th className="px-4 py-3">Назначение</th>
                    <th className="px-4 py-3">События</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isPending ? (
                    Array.from({ length: size }).map((_, rowIndex) => (
                      <tr key={rowIndex} className="animate-pulse">
                        {Array.from({ length: 9 }).map((__, cellIndex) => (
                          <td className="px-4 py-4" key={cellIndex}>
                            <div className="h-4 w-20 rounded bg-gray-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-14 text-center text-gray-400"
                      >
                        <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                        Инциденты не найдены
                      </td>
                    </tr>
                  ) : (
                    items.map((incident) => (
                      <tr
                        key={incident.incident_id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="max-w-[220px] px-4 py-4">
                          <Link
                            href={`/admin/incidents/${encodeURIComponent(incident.incident_id)}`}
                            className="truncate font-mono text-xs font-semibold text-gray-900"
                            title={`Открыть инцидент ${incident.incident_id}`}
                          >
                            {incident.incident_id}
                          </Link>
                          <div className="mt-1 truncate text-xs text-gray-400">
                            {incident.organization_id}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                          {formatDate(incident.start_time)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                              severityStyles[incident.severity] ??
                              "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                          >
                            {incident.severity}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">
                          {incident.risk_score}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {statusLabels[incident.analyst_status]}
                        </td>
                        <td
                          className="max-w-[180px] truncate px-4 py-4"
                          title={incident.attack_type}
                        >
                          {incident.attack_type || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {incident.source_ip ?? incident.source_user ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {incident.destination_ip ??
                            incident.destination_host ??
                            "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="font-medium text-gray-700">
                            {incident.event_count}
                          </span>
                          <span className="ml-1 text-xs text-gray-400">
                            ({incident.scenario_count} сценариев)
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4">
            <PaginationControl
              page={page}
              limit={size}
              total={total}
              onPageChange={setPage}
              onLimitChange={(newSize) => {
                setSize(newSize);
                setPage(1);
              }}
              isLoading={isPending}
            />
          </div>
        </>
      )}
    </section>
  );
}
