"use client";

import { useState } from "react";
import { ChevronDown, FileSearch, SquarePlus } from "lucide-react";
import Link from "next/link";
import { PaginationControl } from "@/shared/ui/pagination";
import { DateRangeFilter, PeriodBadge } from "@/shared/ui/filter-bar";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  getEventDestinationIp,
  getEventHostname,
  getEventOrganization,
  getEventRef,
  getEventSourceIp,
  getEventSourceName,
  getEventTimestamp,
  getEventUser,
  useEvents,
  type WazuhEvent,
} from "@/entities/event";
import { EventsFilter, type EventFilterParams } from "@/features/events-filter";

// Вёрстка по фрейму «Raw data» макета CERT-KG SIEM (Figma 528:4243)

const PAGE_SIZE = 15;

// "2026-10-01 06:53:42" по местному времени
const dateTimeFormatter = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "short",
  timeStyle: "medium",
});

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

type SortKey = "time" | "source" | "user" | "source_ip" | "destination_ip" | "hostname" | "organization";

const columns: Array<{
  key: SortKey;
  label: string;
  width: string;
  getValue: (event: WazuhEvent) => string | null;
  center?: boolean;
}> = [
  { key: "time", label: "Время", width: "w-[184px]", getValue: getEventTimestamp },
  { key: "source", label: "Источник", width: "w-[128px]", getValue: getEventSourceName },
  { key: "user", label: "Users", width: "w-[128px]", getValue: getEventUser },
  { key: "source_ip", label: "Source IP", width: "w-[144px]", getValue: getEventSourceIp },
  { key: "destination_ip", label: "Destination IP", width: "w-[144px]", getValue: getEventDestinationIp },
  { key: "hostname", label: "Hostname", width: "w-[110px]", getValue: getEventHostname, center: true },
  { key: "organization", label: "Организация", width: "w-[120px]", getValue: getEventOrganization, center: true },
];

// Сортировка в пределах загруженной страницы, как в таблице инцидентов
function sortEvents(items: WazuhEvent[], sort: { key: SortKey; direction: "asc" | "desc" } | null) {
  if (!sort) return items;
  const column = columns.find((item) => item.key === sort.key);
  if (!column) return items;
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const left = column.getValue(a) ?? "";
    const right = column.getValue(b) ?? "";
    if (sort.key === "time") {
      return (new Date(left).getTime() - new Date(right).getTime()) * factor || 0;
    }
    return left.localeCompare(right, "ru", { numeric: true }) * factor;
  });
}

const cellClass = "px-1.5 py-3 text-sm text-ink";

export function EventsTable() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState<EventFilterParams>({});
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const { data, isPending, isFetching, error, refetch } = useEvents({ page, size, ...filters });
  const items = sortEvents(data?.items ?? [], sort);

  const handleFiltersChange = (nextFilters: EventFilterParams) => {
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
      <h1 className="sr-only">Raw data</h1>

      <EventsFilter filters={filters} onChange={handleFiltersChange} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodBadge from={filters.from_time} to={filters.to_time} />
        <DateRangeFilter
          from={filters.from_time}
          to={filters.to_time}
          onSubmit={({ from_time, to_time }) => {
            const next = { ...filters, from_time, to_time };
            if (!from_time) delete next.from_time;
            if (!to_time) delete next.to_time;
            handleFiltersChange(next);
          }}
        />
      </div>

      {error ? (
        <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">Не удалось загрузить события</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
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
                  Array.from({ length: size }).map((_, rowIndex) => (
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
                      <FileSearch className="mx-auto mb-2 h-8 w-8 text-line" />
                      События не найдены
                    </td>
                  </tr>
                ) : (
                  items.map((event, index) => {
                    const ref = getEventRef(event);
                    const href = ref ? routes.event(ref.index, ref.id) : null;
                    return (
                      <tr
                        key={ref ? `${ref.index}/${ref.id}` : index}
                        className="transition-colors hover:bg-surface-muted"
                      >
                        <td className="py-3 pr-1.5 pl-4">
                          {href && (
                            <Link
                              href={href}
                              aria-label={`Открыть событие ${event.id ?? ref?.id ?? ""}`}
                              className="flex justify-center text-[#595555] hover:text-brand-light"
                            >
                              <SquarePlus className="size-[18px]" />
                            </Link>
                          )}
                        </td>
                        {columns.map((column) => {
                          const value = column.getValue(event);
                          return (
                            <td
                              key={column.key}
                              className={cn(
                                cellClass,
                                column.key === "time" ? "whitespace-nowrap" : "break-all",
                                column.center && "text-center",
                                column.key === "organization" && "pr-4",
                              )}
                            >
                              {column.key === "time" ? formatDate(value) : (value ?? "—")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControl
            page={page}
            limit={size}
            total={data?.total ?? 0}
            onPageChange={setPage}
            onLimitChange={(nextSize) => {
              setSize(nextSize);
              setPage(1);
            }}
            pageSizeOptions={[15, 30, 50, 100]}
            isLoading={isFetching}
            itemsLabel="событий"
            className="bg-surface-muted px-4 py-3"
          />
        </div>
      )}
    </section>
  );
}
