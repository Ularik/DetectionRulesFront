"use client";

import { useState } from "react";
import { ArrowDown, ArrowLeft, ChevronRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaginationControl } from "@/shared/ui/pagination";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import { useAttackGroups, type HuntingIpIncidentSchema } from "@/entities/attack-type";

// Вёрстка по фрейму «Инцидент: <source_ip>» макета CERT-KG SIEM (Figma 103:2509)

const PAGE_SIZE = 10;

// "2026/10/01 06:53:42" по местному времени, как в макете
const dateTimeFormatter = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "short",
  timeStyle: "medium",
});

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date).replaceAll("-", "/");
}

type SortKey =
  | "incident_id"
  | "attack_type"
  | "organization_id"
  | "event_count"
  | "destination_ip"
  | "start_time"
  | "tactics";

const columns: Array<{ key: SortKey; label: string; width: string }> = [
  { key: "incident_id", label: "ID инцидента", width: "w-[170px]" },
  { key: "attack_type", label: "Тип атаки", width: "w-[161px]" },
  { key: "organization_id", label: "Организация", width: "w-[161px]" },
  { key: "event_count", label: "Количество", width: "w-[161px]" },
  { key: "destination_ip", label: "Destination IP", width: "w-[161px]" },
  { key: "start_time", label: "Время инцидента", width: "w-[191px]" },
  { key: "tactics", label: "Этап атаки", width: "w-[145px]" },
];

function getDestination(incident: HuntingIpIncidentSchema) {
  return incident.destination_ip ?? incident.destination_ips[0] ?? incident.destination_host;
}

function getSortValue(incident: HuntingIpIncidentSchema, key: SortKey) {
  switch (key) {
    case "event_count":
      return incident.event_count;
    case "start_time":
      return incident.start_time ? new Date(incident.start_time).getTime() : 0;
    case "tactics":
      return incident.tactics.join(", ");
    case "destination_ip":
      return getDestination(incident) ?? "";
    default:
      return incident[key] ?? "";
  }
}

// Сортировка в пределах загруженной страницы, как в основной таблице инцидентов
function sortIncidents(
  items: HuntingIpIncidentSchema[],
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

const cellClass = "px-1.5 py-3 text-center text-sm text-black";

export function SourceIpIncidents({
  sourceIp,
  variant = "page",
}: {
  sourceIp: string;
  variant?: "page" | "modal";
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const { data, isPending, isFetching, error, refetch } = useAttackGroups({
    source_ip: sourceIp,
    page,
    size: PAGE_SIZE,
  });
  const items = sortIncidents(data?.incidents ?? [], sort);
  const total = data?.summary.incident_count ?? 0;

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current?.key === key && current.direction === "desc"
        ? { key, direction: "asc" }
        : { key, direction: "desc" },
    );
  };

  const card = (
    <section className="flex flex-col overflow-hidden rounded-[20px] border border-brand-light bg-white">
      <header className="flex h-[57px] shrink-0 items-center bg-linear-to-r from-brand to-brand-light pr-14 pl-[33px]">
        <h1 className="truncate text-base font-medium text-white">Инцидент: {sourceIp}</h1>
      </header>

      {error ? (
        <div className="space-y-3 px-6 py-16 text-center">
          <p className="font-semibold text-ink">Не удалось загрузить инциденты</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "overflow-auto px-8 pb-2",
              variant === "modal" && "max-h-[calc(100dvh-13rem)]",
            )}
          >
            <table className="w-full min-w-[1180px] border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  <th className="w-16 py-3.5">
                    <span className="sr-only">Открыть</span>
                  </th>
                  {columns.map((column) => {
                    const isSorted = sort?.key === column.key;
                    return (
                      <th
                        key={column.key}
                        className={cn("border-b border-brand-light/50 px-1.5 py-3.5", column.width)}
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
                          className="mx-auto flex items-center gap-2.5 text-sm font-medium whitespace-nowrap text-black"
                        >
                          {column.label}
                          <ArrowDown
                            className={cn(
                              "size-4 transition-transform",
                              isSorted ? "text-brand-light" : "text-black",
                              isSorted && sort.direction === "asc" && "rotate-180",
                            )}
                          />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light/25 border-b border-brand-light/25">
                {isPending ? (
                  Array.from({ length: PAGE_SIZE }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="animate-pulse">
                      {Array.from({ length: columns.length + 1 }).map((__, cellIndex) => (
                        <td className="px-4 py-4" key={cellIndex}>
                          <div className="mx-auto h-4 w-20 rounded bg-line-muted" />
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
                  items.map((incident) => (
                    <tr
                      key={incident.incident_id}
                      onClick={() => router.push(routes.incident(incident.incident_id))}
                      className="cursor-pointer transition-colors hover:bg-surface-muted"
                    >
                      <td className="py-3 pl-5">
                        <Link
                          href={routes.incident(incident.incident_id)}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Открыть инцидент ${incident.incident_id}`}
                          className="flex text-black hover:text-brand-light"
                        >
                          <ChevronRight className="size-6" strokeWidth={1.5} />
                        </Link>
                      </td>
                      <td className={cn(cellClass, "break-all text-brand")}>
                        {incident.incident_id}
                      </td>
                      <td className={cn(cellClass, "break-all")}>{incident.attack_type || "—"}</td>
                      <td className={cn(cellClass, "break-all")}>
                        {incident.organization_id || "—"}
                      </td>
                      <td className={cellClass}>{incident.event_count}</td>
                      <td className={cn(cellClass, "whitespace-nowrap")}>
                        {getDestination(incident) ?? "—"}
                      </td>
                      <td className={cn(cellClass, "whitespace-nowrap")}>
                        {formatDate(incident.start_time)}
                      </td>
                      <td className={cellClass}>
                        {incident.tactics.length ? incident.tactics.join(", ") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationControl
            page={page}
            limit={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            isLoading={isFetching}
            itemsLabel="инцидентов"
            className="border-brand-light/50 px-10 py-3"
          />
        </>
      )}
    </section>
  );

  if (variant === "modal") return card;

  return (
    <main className="mx-auto max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => router.push(routes.incidents)}
        className="mb-4 -ml-3"
      >
        <ArrowLeft /> К списку инцидентов
      </Button>
      {card}
    </main>
  );
}
