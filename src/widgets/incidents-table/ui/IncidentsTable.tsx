"use client";

import { useState } from "react";
import { ChevronDown, Eye, EyeOff, CircleDashed, ShieldAlert, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaginationControl } from "@/shared/ui/pagination";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  INCIDENT_SEVERITY_COLORS,
  useDailyIncidentCount,
  useIncidents,
  type IncidentLite,
} from "@/entities/incident";
import {
  IncidentsDateRange,
  IncidentsFilter,
  formatPeriod,
  type IncidentFilterParams,
} from "@/features/incidents-filter";
import { IncidentsActivityChart } from "./IncidentsActivityChart";

const PAGE_SIZE = 10;

// "2026-10-01 06:53:42" по местному времени
const dateTimeFormatter = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "short",
  timeStyle: "medium",
});

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
};

const SEVERITY_RANK: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

type SortKey =
  | "incident_id"
  | "organization_id"
  | "severity"
  | "source_ip"
  | "destination_ip"
  | "end_time"
  | "start_time";

const columns: Array<{ key: SortKey; label: string; width: string }> = [
  { key: "incident_id", label: "ID инцидента", width: "w-[164px]" },
  { key: "organization_id", label: "Организация", width: "w-[128px]" },
  { key: "severity", label: "Критичность", width: "w-[128px]" },
  { key: "source_ip", label: "Source IP", width: "w-[144px]" },
  { key: "destination_ip", label: "Destination IP", width: "w-[144px]" },
  { key: "end_time", label: "Время", width: "w-[184px]" },
  { key: "start_time", label: "Начало инцидента", width: "w-[184px]" },
];

function getSortValue(incident: IncidentLite, key: SortKey) {
  if (key === "severity") return SEVERITY_RANK[incident.severity] ?? 0;
  if (key === "end_time" || key === "start_time") {
    return incident[key] ? new Date(incident[key]).getTime() : 0;
  }
  return incident[key] ?? "";
}

// Сортировка в пределах загруженной страницы
function sortIncidents(
  items: IncidentLite[],
  sort: { key: SortKey; direction: "asc" | "desc" } | null,
) {
  if (!sort) return items;
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const left = getSortValue(a, sort.key);
    const right = getSortValue(b, sort.key);
    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * factor;
    }
    return String(left).localeCompare(String(right), "ru", { numeric: true }) * factor;
  });
}

const cellClass = "px-1.5 py-3 text-sm text-ink";

export function IncidentsTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<IncidentFilterParams>({});
  const [isChartVisible, setIsChartVisible] = useState(true);
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const { data, isPending, error, refetch } = useIncidents({
    page,
    size: PAGE_SIZE,
    ...filters,
  });
  const { data: dailyCounts, isPending: isDailyPending } = useDailyIncidentCount({
    from_time: filters.from_time,
    to_time: filters.to_time,
  });
  const items = sortIncidents(data?.items ?? [], sort);
  const total = data?.total ?? 0;
  const periodLabel = formatPeriod(filters.from_time, filters.to_time);

  const handleFiltersChange = (nextFilters: IncidentFilterParams) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current?.key === key && current.direction === "desc"
        ? { key, direction: "asc" }
        : { key, direction: "desc" },
    );
  };

  return (
    <section className="flex flex-col gap-[18px]">
      <h1 className="sr-only">Инциденты</h1>

      <IncidentsFilter filters={filters} onChange={handleFiltersChange} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-ink">
          <CircleDashed className="size-6 text-[#0088ff]" />
          {periodLabel}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsChartVisible((visible) => !visible)}
            aria-pressed={!isChartVisible}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-muted"
          >
            {isChartVisible ? <Eye className="size-6" /> : <EyeOff className="size-6" />}
            {isChartVisible ? "Скрыть диаграмму" : "Показать диаграмму"}
          </button>
          <IncidentsDateRange filters={filters} onChange={handleFiltersChange} />
        </div>
      </div>

      {isChartVisible && !error && (
        <IncidentsActivityChart
          dailyCounts={dailyCounts ?? []}
          periodLabel={periodLabel}
          isPending={isDailyPending}
        />
      )}

      {error ? (
        <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">Не удалось загрузить инциденты</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead className="border-b border-line-muted bg-surface-muted">
                <tr>
                  <th className="w-10 py-3.5 pr-1.5 pl-4">
                    <span className="sr-only">Открыть</span>
                  </th>
                  {columns.map((column) => {
                    const isSorted = sort?.key === column.key;
                    return (
                      <th
                        key={column.key}
                        className={cn("px-1.5 py-3.5", column.width)}
                        aria-sort={
                          isSorted
                            ? sort.direction === "asc"
                              ? "ascending"
                              : "descending"
                            : undefined
                        }
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className="flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap text-ink"
                        >
                          {column.label}
                          <ChevronDown
                            className={cn(
                              "size-3.5 transition-transform",
                              isSorted ? "text-brand-light" : "text-ink-muted",
                              isSorted && sort.direction === "asc" && "rotate-180",
                            )}
                          />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-muted">
                {isPending ? (
                  Array.from({ length: PAGE_SIZE }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="animate-pulse">
                      {Array.from({ length: columns.length + 1 }).map((__, cellIndex) => (
                        <td className="px-4 py-4" key={cellIndex}>
                          <div className="h-4 w-20 rounded bg-line-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-14 text-center text-sm text-ink-muted"
                    >
                      <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-line" />
                      Инциденты не найдены
                    </td>
                  </tr>
                ) : (
                  items.map((incident) => {
                    const severity = INCIDENT_SEVERITY_COLORS[incident.severity];
                    return (
                      <tr
                        key={incident.incident_id}
                        onClick={() => router.push(routes.incident(incident.incident_id))}
                        className="cursor-pointer transition-colors hover:bg-surface-muted"
                      >
                        <td className="py-3 pr-1.5 pl-4">
                          <Link
                            href={routes.incident(incident.incident_id)}
                            onClick={(event) => event.stopPropagation()}
                            aria-label={`Открыть инцидент ${incident.incident_id}`}
                            className="flex justify-center text-[#595555] hover:text-brand-light"
                          >
                            <SquarePlus className="size-[18px]" />
                          </Link>
                        </td>
                        <td className={cn(cellClass, "max-w-[164px] truncate")} title={incident.incident_id}>
                          {incident.incident_id}
                        </td>
                        <td className={cn(cellClass, "max-w-[128px] truncate")} title={incident.organization_id}>
                          {incident.organization_id || "—"}
                        </td>
                        <td className={cellClass}>
                          <span className="flex items-center gap-2">
                            <span
                              className={cn("size-2 shrink-0 rounded-full bg-ink-muted", severity?.dot)}
                            />
                            {incident.severity}
                          </span>
                        </td>
                        <td className={cn(cellClass, "whitespace-nowrap")}>
                          {incident.source_ip ?? incident.source_user ?? "—"}
                        </td>
                        <td className={cn(cellClass, "whitespace-nowrap")}>
                          {incident.destination_ip ?? incident.destination_host ?? "—"}
                        </td>
                        <td className={cn(cellClass, "whitespace-nowrap")}>
                          {formatDate(incident.end_time)}
                        </td>
                        <td className={cn(cellClass, "whitespace-nowrap pr-4")}>
                          {formatDate(incident.start_time)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControl
            page={page}
            limit={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            isLoading={isPending}
            itemsLabel="инцидентов"
            className="bg-surface-muted px-4 py-3"
          />
        </div>
      )}
    </section>
  );
}
