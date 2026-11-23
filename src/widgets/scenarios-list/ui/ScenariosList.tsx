"use client";

import { Fragment, useState } from "react";
import { ArrowDown, ShieldAlert, SquareMinus, SquarePlus } from "lucide-react";
import Link from "next/link";
import { PaginationControl } from "@/shared/ui/pagination";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import { INCIDENT_SEVERITY_COLORS } from "@/entities/incident";
import { useScenarios, type SecurityScenario } from "@/entities/scenario";
import { ScenariosFilter, type ScenarioFilterParams } from "@/features/scenarios-filter";
import { ScenarioExpandedRow } from "./ScenarioExpandedRow";
import {
  formatDateTime,
  getAnalystStatusLabel,
  sortItems,
  type SortState,
} from "../lib/table";

// Вёрстка по фрейму «Сценарии» макета CERT-KG SIEM (Figma 471:3736)

const PAGE_SIZE = 10;

type SortKey =
  | "first_seen"
  | "scenario_id"
  | "source_ip"
  | "destination_ip"
  | "analyst_status"
  | "severity"
  | "organization_id"
  | "incident_count";

const SEVERITY_RANK: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

const columns: Array<{ key: SortKey; label: string; width: string }> = [
  { key: "first_seen", label: "Период", width: "w-[176px]" },
  { key: "scenario_id", label: "ID сценария", width: "w-[160px]" },
  { key: "source_ip", label: "Source IP", width: "w-[128px]" },
  { key: "destination_ip", label: "Destination IP", width: "w-[128px]" },
  { key: "analyst_status", label: "Статус", width: "w-[112px]" },
  { key: "severity", label: "Критичность", width: "w-[136px]" },
  { key: "organization_id", label: "Организация", width: "w-[140px]" },
  { key: "incident_count", label: "Инциденты", width: "w-[116px]" },
];

function getSortValue(scenario: SecurityScenario, key: SortKey) {
  switch (key) {
    case "first_seen":
      return scenario.first_seen ? new Date(scenario.first_seen).getTime() : 0;
    case "severity":
      return scenario.severity ? SEVERITY_RANK[scenario.severity] : 0;
    case "incident_count":
      return scenario.incident_count ?? 0;
    default:
      return scenario[key] ?? "";
  }
}

const cellClass = "px-1.5 py-3 text-center text-sm text-black";

export function ScenariosList() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState<ScenarioFilterParams>({});
  const [sort, setSort] = useState<SortState<SortKey>>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isPending, isFetching, error, refetch } = useScenarios({
    page,
    size,
    ...filters,
  });
  const items = sortItems(data?.items ?? [], sort, getSortValue);

  const handleFiltersChange = (nextFilters: ScenarioFilterParams) => {
    setFilters(nextFilters);
    setPage(1);
    setExpandedId(null);
  };

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current?.key === key && current.direction === "desc"
        ? { key, direction: "asc" }
        : { key, direction: "desc" },
    );
  };

  const toggleRow = (scenarioId: string) =>
    setExpandedId((current) => (current === scenarioId ? null : scenarioId));

  return (
    <section className="flex flex-col gap-2">
      <h1 className="sr-only">Сценарии</h1>

      <ScenariosFilter filters={filters} onChange={handleFiltersChange} />

      {error ? (
        <div className="mt-2 space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">Не удалось загрузить сценарии</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead className="border-b border-line-muted">
                <tr>
                  <th className="w-[42px] py-2.5 pl-2">
                    <span className="sr-only">Развернуть</span>
                  </th>
                  {columns.map((column) => {
                    const isSorted = sort?.key === column.key;
                    return (
                      <th
                        key={column.key}
                        className={cn("px-1.5 py-2.5", column.width)}
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
              <tbody>
                {isPending ? (
                  Array.from({ length: size }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="animate-pulse border-b border-line-muted">
                      {Array.from({ length: columns.length + 1 }).map((__, cellIndex) => (
                        <td className="px-4 py-4" key={cellIndex}>
                          <div className="mx-auto h-4 w-16 rounded bg-line-muted" />
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
                      Сценарии не найдены
                    </td>
                  </tr>
                ) : (
                  items.map((scenario, index) => {
                    const scenarioId = scenario.scenario_id ?? `row-${index}`;
                    const isExpanded = expandedId === scenarioId;
                    const severity = scenario.severity
                      ? INCIDENT_SEVERITY_COLORS[scenario.severity]
                      : undefined;
                    const ToggleIcon = isExpanded ? SquareMinus : SquarePlus;

                    return (
                      <Fragment key={scenarioId}>
                        <tr
                          className={cn(
                            "border-b border-line-muted transition-colors hover:bg-surface-muted",
                            isExpanded && "bg-surface-muted",
                          )}
                        >
                          <td className="py-2 pl-2">
                            <button
                              type="button"
                              onClick={() => toggleRow(scenarioId)}
                              aria-expanded={isExpanded}
                              aria-label={`${isExpanded ? "Свернуть" : "Развернуть"} сценарий ${scenario.scenario_id ?? ""}`}
                              className="flex size-6 items-center justify-center text-[#595555] hover:text-brand-light"
                            >
                              <ToggleIcon className="size-[18px]" />
                            </button>
                          </td>
                          <td className={cn(cellClass, "py-2 leading-[17px] whitespace-nowrap")}>
                            {formatDateTime(scenario.first_seen, false)}
                            <br />
                            {formatDateTime(scenario.last_seen, false)}
                          </td>
                          <td className={cn(cellClass, "break-all")}>
                            {scenario.scenario_id ? (
                              <Link
                                href={routes.scenario(scenario.scenario_id)}
                                title="Открыть страницу сценария"
                                className="hover:text-brand-light hover:underline"
                              >
                                {scenario.scenario_id}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className={cn(cellClass, "whitespace-nowrap")}>
                            {scenario.source_ip ?? "—"}
                          </td>
                          <td className={cn(cellClass, "whitespace-nowrap")}>
                            {scenario.destination_ip ?? "—"}
                          </td>
                          <td className={cellClass}>
                            {getAnalystStatusLabel(scenario.analyst_status)}
                          </td>
                          <td className={cellClass}>
                            <span className="inline-flex items-center gap-[5px]">
                              <span
                                className={cn(
                                  "size-2 shrink-0 rounded-full bg-ink-muted",
                                  severity?.dot,
                                )}
                              />
                              {scenario.severity ?? "—"}
                            </span>
                          </td>
                          <td className={cn(cellClass, "break-all")}>
                            {scenario.organization_id || "—"}
                          </td>
                          <td className={cn(cellClass, "pr-4")}>
                            {scenario.incident_count ?? 0}
                          </td>
                        </tr>
                        {isExpanded && scenario.scenario_id && (
                          <tr className="border-b border-line-muted">
                            <td colSpan={columns.length + 1} className="p-0">
                              <ScenarioExpandedRow
                                scenario={scenario}
                                scenarioId={scenario.scenario_id}
                                onCollapse={() => setExpandedId(null)}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
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
            onPageChange={(nextPage) => {
              setPage(nextPage);
              setExpandedId(null);
            }}
            onLimitChange={(nextSize) => {
              setSize(nextSize);
              setPage(1);
              setExpandedId(null);
            }}
            isLoading={isFetching}
            itemsLabel="сценариев"
            className="px-4 py-3"
          />
        </div>
      )}
    </section>
  );
}
