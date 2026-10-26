"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { PaginationControl } from "@/shared/ui/pagination";
import { Button } from "@/shared/ui/button";
import { routes } from "@/shared/config";
import {
  INCIDENT_SEVERITY_STYLES,
  INCIDENT_STATUS_LABELS,
  useIncidents,
} from "@/entities/incident";
import {
  IncidentsFilter,
  type IncidentFilterParams,
} from "@/features/incidents-filter";

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

export function IncidentsTable() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState<IncidentFilterParams>({});
  const { data, isPending, error, refetch } = useIncidents({
    page,
    size,
    ...activeFilters,
  });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <section>
      <div className="mb-5 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Инциденты</h1>
        <p className="mt-1 text-sm text-gray-500">
          Обнаруженные события и результаты их анализа
        </p>
      </div>

      <IncidentsFilter
        isPending={isPending}
        activeFilterCount={activeFilterCount}
        onApply={(filters) => {
          setActiveFilters(filters);
          setPage(1);
        }}
        onClear={() => {
          setActiveFilters({});
          setPage(1);
        }}
      />

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
        // ТАБЛИЦА ИНЦИДЕНТОВ
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm text-gray-600">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">ID Инцидента</th>
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
                            href={routes.incident(incident.incident_id)}
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
                              INCIDENT_SEVERITY_STYLES[incident.severity] ??
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
                          {INCIDENT_STATUS_LABELS[incident.analyst_status]}
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
