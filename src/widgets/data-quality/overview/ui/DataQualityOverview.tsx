"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Layers,
  RefreshCw,
  Search,
  Target,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PaginationControl } from "@/shared/ui/pagination";
import { PageHeader, pageStackClass } from "@/shared/ui/page-header";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import { useOrganizations } from "@/entities/organization";
import { getSourceTypeLabel, useSources } from "@/entities/source";
import {
  DATA_QUALITY_LEVEL_LABELS,
  DATA_QUALITY_PERIODS,
  DEFAULT_DATA_QUALITY_HOURS,
  UNKNOWN_ORGANIZATION_ID,
  dataQualityKeys,
  formatCount,
  formatPercent,
  getQualityLevel,
  normalizedEvents,
  qualityPercent,
  useDataQualitySources,
  useDataQualitySummary,
  type DataQualityLevel,
  type DataQualityParams,
} from "@/entities/data-quality";
import { buildRows, type QualityRow } from "../lib/rows";
import { QualityLevelBadge, SourceStateBadge } from "./badges";
import { QualityDonut, SourcesQualityBars, StatusLegend } from "./charts";
import { NormalizationIssues } from "./NormalizationIssues";
import { SourceQualityPanel } from "./SourceQualityPanel";

// Вёрстка по макету «Качество данных (Data Quality)» (public/images/data-quality.jpeg).
// Данные — /data-quality/summary и /data-quality/sources, справочник источников — /sources.
// Вкладок «Метрики» и «Отчёты» из макета нет: у backend нет для них данных (и нет временного ряда
// для «Динамики качества»)

type Tab = "sources" | "issues";
type SortKey = "name" | "type" | "profile" | "total" | "normalized" | "warning" | "error" | "coverage" | "quality";
type StateFilter = "" | "enabled" | "disabled";

const CHART_LIMIT = 8;

function StatCard({
  icon,
  iconClass,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)]">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", iconClass)}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-xs text-ink-muted">{label}</p>
        <p className="text-xl leading-tight font-semibold text-ink tabular-nums">{value}</p>
        {sub && <p className="truncate text-xs text-ink-muted">{sub}</p>}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative flex h-10 min-w-[160px] items-center gap-1.5 rounded-xl border border-line bg-white pr-9 pl-3.5 text-sm text-ink focus-within:border-brand-light focus-within:ring-2 focus-within:ring-brand-light/20">
      <span className="text-ink-muted">{label}:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent font-medium outline-none"
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 size-4 text-ink-muted" />
    </label>
  );
}

const sortValue = (row: QualityRow, key: SortKey): string | number => {
  const stats = row.stats;
  switch (key) {
    case "name":
      return row.name.toLowerCase();
    case "type":
      return getSourceTypeLabel(row.sourceType).toLowerCase();
    case "profile":
      return row.profiles.join(", ").toLowerCase();
    case "total":
      return stats?.total_events ?? -1;
    case "normalized":
      return stats ? normalizedEvents(stats) : -1;
    case "warning":
      return stats?.warning_events ?? -1;
    case "error":
      return stats?.error_events ?? -1;
    case "coverage":
      return stats?.total_events ? stats.avg_coverage_percent : -1;
    case "quality":
      return stats ? qualityPercent(stats) ?? -1 : -1;
  }
};

function SortHead({
  label,
  column,
  sort,
  onSort,
  className,
}: {
  label: string;
  column: SortKey;
  sort: { key: SortKey; dir: 1 | -1 };
  onSort: (column: SortKey) => void;
  className?: string;
}) {
  const active = sort.key === column;
  return (
    <th
      className={cn(headClass, className)}
      aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
    >
      <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1">
        {label}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-3.5 transition-transform",
            active ? "text-ink" : "text-ink-muted/50",
            active && sort.dir === 1 && "rotate-180",
          )}
        />
      </button>
    </th>
  );
}

const headClass = "px-3 py-3 text-left text-[13px] font-semibold whitespace-nowrap text-ink";
const cellClass = "px-3 py-3 text-sm text-ink";

export function DataQualityOverview() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("sources");
  const [hours, setHours] = useState<number>(DEFAULT_DATA_QUALITY_HOURS);
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stateFilter, setStateFilter] = useState<StateFilter>("");
  const [levelFilter, setLevelFilter] = useState<DataQualityLevel | "">("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "total", dir: -1 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Организация фильтруется на backend — она влияет и на сводку, и на графики
  const params: DataQualityParams = useMemo(
    () => ({ hours, ...(organizationFilter ? { organization_id: organizationFilter } : {}) }),
    [hours, organizationFilter],
  );
  const summary = useDataQualitySummary(params);
  const sourcesQuality = useDataQualitySources(params);
  const { data: sourcesData } = useSources();
  const { data: organizationsData } = useOrganizations();

  const organizationNames = useMemo(
    () => new Map((organizationsData?.items ?? []).map((item) => [item.organization_id, item.name])),
    [organizationsData],
  );
  const organizationName = (id: string | null) => {
    if (!id) return "—";
    if (id === UNKNOWN_ORGANIZATION_ID) return "Не определена";
    return organizationNames.get(id) ?? id;
  };

  const allRows = useMemo(() => {
    const configured = (sourcesData?.items ?? []).filter(
      (source) => !organizationFilter || source.organization_id === organizationFilter,
    );
    return buildRows(sourcesQuality.data?.items ?? [], configured, { includeIdle: true });
  }, [sourcesQuality.data, sourcesData, organizationFilter]);

  const organizationOptions = useMemo(() => {
    const ids = new Set<string>([
      ...organizationNames.keys(),
      ...(sourcesData?.items ?? []).map((source) => source.organization_id).filter((id): id is string => Boolean(id)),
    ]);
    return [...ids].map((id) => ({ id, name: organizationNames.get(id) ?? id })).sort((a, b) => a.name.localeCompare(b.name));
  }, [organizationNames, sourcesData]);
  const typeOptions = [...new Set(allRows.map((row) => row.sourceType).filter((type): type is string => Boolean(type)))].sort();

  const query = search.trim().toLowerCase();
  const filtered = allRows
    .filter((row) => {
      if (query) {
        const haystack = [row.id, row.name, getSourceTypeLabel(row.sourceType), ...row.profiles].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (typeFilter && row.sourceType !== typeFilter) return false;
      if (stateFilter === "enabled" && row.enabled !== true) return false;
      if (stateFilter === "disabled" && row.enabled !== false) return false;
      if (levelFilter && (row.stats ? getQualityLevel(row.stats) : "empty") !== levelFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const left = sortValue(a, sort.key);
      const right = sortValue(b, sort.key);
      const result = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right));
      return result * sort.dir || a.name.localeCompare(b.name);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedRow = allRows.find((row) => row.id === selectedId) ?? null;

  const chartRows = allRows
    .filter((row): row is QualityRow & { stats: NonNullable<QualityRow["stats"]> } => Boolean(row.stats?.total_events))
    .sort((a, b) => b.stats.total_events - a.stats.total_events);

  const stats = summary.data;
  const profilesCount = new Set(allRows.flatMap((row) => row.profiles)).size;
  const activeSources = chartRows.length;

  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const toggleSort = (key: SortKey) =>
    setSort((current) => ({ key, dir: current.key === key ? (current.dir === 1 ? -1 : 1) : key === "name" || key === "type" || key === "profile" ? 1 : -1 }));

  const refresh = () => queryClient.invalidateQueries({ queryKey: dataQualityKeys.all });
  const isError = summary.isError || sourcesQuality.isError;
  const isFetching = summary.isFetching || sourcesQuality.isFetching;

  const tabClass = (active: boolean) =>
    cn(
      "rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
      active ? "bg-brand-light text-white" : "text-ink hover:bg-white",
    );

  return (
    <section className={pageStackClass}>
      <PageHeader
        title="Качество данных"
        description="Полнота и корректность нормализации событий по источникам"
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "sources"} onClick={() => setTab("sources")} className={tabClass(tab === "sources")}>
            Источники
          </button>
          <button type="button" role="tab" aria-selected={tab === "issues"} onClick={() => setTab("issues")} className={tabClass(tab === "issues")}>
            Ошибки нормализации
          </button>
          <Link href={routes.normalizationProfiles} className={tabClass(false)}>
            Профили нормализации
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="relative flex h-11 items-center gap-2 rounded-xl border border-line bg-white pr-9 pl-3 text-sm font-medium text-ink focus-within:ring-2 focus-within:ring-brand-light/20">
            <Clock3 className="size-4 text-brand-light" aria-hidden />
            <select
              value={hours}
              onChange={(event) => withPageReset(setHours)(Number(event.target.value))}
              aria-label="Период"
              className="cursor-pointer appearance-none bg-transparent outline-none"
            >
              {DATA_QUALITY_PERIODS.map((period) => (
                <option key={period.hours} value={period.hours}>
                  {period.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-3 size-4 text-ink-muted" />
          </label>
          <button
            type="button"
            onClick={refresh}
            disabled={isFetching}
            aria-label="Обновить данные"
            title="Обновить данные"
            className="flex size-11 items-center justify-center rounded-xl border border-line bg-white text-ink hover:bg-surface-muted disabled:opacity-60"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {isError ? (
        <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">Не удалось загрузить статистику качества данных</p>
          <Button variant="outline" onClick={refresh}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className={cn("grid items-start gap-5", selectedRow && tab === "sources" && "xl:grid-cols-[minmax(0,1fr)_380px]")}>
          <div className="flex min-w-0 flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              <StatCard
                icon={<Layers className="size-5" />}
                iconClass="bg-[#e0edff] text-[#2563eb]"
                label="Событий всего"
                value={formatCount(stats?.total_events)}
              />
              <StatCard
                icon={<CheckCircle2 className="size-5" />}
                iconClass="bg-[#dcfce7] text-[#16a34a]"
                label="Нормализовано"
                value={formatCount(stats ? normalizedEvents(stats) : null)}
                sub={stats?.total_events ? formatPercent(stats.good_percent + stats.warning_percent) : undefined}
              />
              <StatCard
                icon={<AlertTriangle className="size-5" />}
                iconClass="bg-[#fef3c7] text-[#d97706]"
                label="С предупреждениями"
                value={formatCount(stats?.warning_events)}
                sub={stats?.total_events ? formatPercent(stats.warning_percent) : undefined}
              />
              <StatCard
                icon={<XCircle className="size-5" />}
                iconClass="bg-[#fee2e2] text-[#dc2626]"
                label="Ошибки"
                value={formatCount(stats?.error_events)}
                sub={stats?.total_events ? formatPercent(stats.error_percent) : undefined}
              />
              <StatCard
                icon={<Target className="size-5" />}
                iconClass="bg-[#ede9fe] text-[#7c3aed]"
                label="Покрытие полей"
                value={formatPercent(stats?.total_events ? stats.avg_coverage_percent : null)}
                sub="в среднем по событиям"
              />
              <StatCard
                icon={<Layers className="size-5" />}
                iconClass="bg-[#e0f2fe] text-[#0284c7]"
                label="Источников / профилей"
                value={`${activeSources} / ${profilesCount}`}
                sub={`с событиями за период: ${activeSources}`}
              />
            </div>

            {tab === "issues" ? (
              <NormalizationIssues summary={stats} />
            ) : (
              <>
                <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-base font-semibold text-ink">Качество нормализации по источникам</h2>
                      <StatusLegend />
                    </div>
                    {sourcesQuality.isPending ? (
                      <div className="h-40 animate-pulse rounded-lg bg-line-muted" />
                    ) : (
                      <>
                        <SourcesQualityBars
                          rows={chartRows.slice(0, CHART_LIMIT)}
                          onSelect={setSelectedId}
                          selectedId={selectedId}
                        />
                        {chartRows.length > CHART_LIMIT && (
                          <p className="text-xs text-ink-muted">
                            Показаны {CHART_LIMIT} источников с наибольшим числом событий из {chartRows.length}
                          </p>
                        )}
                      </>
                    )}
                  </section>
                  <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
                    <h2 className="text-base font-semibold text-ink">Распределение по результату</h2>
                    {summary.isPending ? (
                      <div className="h-40 animate-pulse rounded-lg bg-line-muted" />
                    ) : (
                      <QualityDonut stats={stats} />
                    )}
                  </section>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="relative block min-w-[220px] flex-[1_1_260px]">
                    <Search aria-hidden className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink-muted" />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => withPageReset(setSearch)(event.target.value)}
                      placeholder="Поиск по источнику, типу, профилю…"
                      aria-label="Поиск источников"
                      className="h-10 w-full rounded-xl border border-line bg-white pr-3.5 pl-10 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
                    />
                  </label>
                  <FilterSelect label="Организация" value={organizationFilter} onChange={withPageReset(setOrganizationFilter)}>
                    <option value="">Все</option>
                    {organizationOptions.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </FilterSelect>
                  <FilterSelect label="Тип" value={typeFilter} onChange={withPageReset(setTypeFilter)}>
                    <option value="">Все</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {getSourceTypeLabel(type)}
                      </option>
                    ))}
                  </FilterSelect>
                  <FilterSelect label="Статус" value={stateFilter} onChange={withPageReset((value: string) => setStateFilter(value as StateFilter))}>
                    <option value="">Все</option>
                    <option value="enabled">Активен</option>
                    <option value="disabled">Отключён</option>
                  </FilterSelect>
                  <FilterSelect label="Качество" value={levelFilter} onChange={withPageReset((value: string) => setLevelFilter(value as DataQualityLevel | ""))}>
                    <option value="">Все</option>
                    {(Object.keys(DATA_QUALITY_LEVEL_LABELS) as DataQualityLevel[]).map((level) => (
                      <option key={level} value={level}>
                        {DATA_QUALITY_LEVEL_LABELS[level]}
                      </option>
                    ))}
                  </FilterSelect>
                </div>

                <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1040px]">
                      <thead className="border-b border-line-muted bg-surface-muted">
                        <tr>
                          <SortHead label="Источник" column="name" sort={sort} onSort={toggleSort} className="pl-5" />
                          <SortHead label="Тип" column="type" sort={sort} onSort={toggleSort} />
                          <SortHead label="Профиль нормализации" column="profile" sort={sort} onSort={toggleSort} />
                          <SortHead label="События" column="total" sort={sort} onSort={toggleSort} className="text-right" />
                          <SortHead label="Нормализовано" column="normalized" sort={sort} onSort={toggleSort} />
                          <SortHead label="Предупр." column="warning" sort={sort} onSort={toggleSort} />
                          <SortHead label="Ошибки" column="error" sort={sort} onSort={toggleSort} />
                          <SortHead label="Покрытие" column="coverage" sort={sort} onSort={toggleSort} />
                          <SortHead label="Качество" column="quality" sort={sort} onSort={toggleSort} />
                          <th className={cn(headClass, "pr-5")}>Статус</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line-muted">
                        {sourcesQuality.isPending ? (
                          Array.from({ length: 5 }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="animate-pulse">
                              {Array.from({ length: 10 }).map((__, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-4 first:pl-5">
                                  <div className="h-4 w-16 rounded bg-line-muted" />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : pageRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-4 py-14 text-center text-sm text-ink-muted">
                              <Layers className="mx-auto mb-2 size-8 text-line" />
                              {allRows.length ? "По заданным условиям ничего не найдено" : "Источников пока нет"}
                            </td>
                          </tr>
                        ) : (
                          pageRows.map((row) => {
                            const rowStats = row.stats;
                            const isSelected = row.id === selectedId;
                            return (
                              <tr
                                key={row.id}
                                aria-selected={isSelected || undefined}
                                onClick={() => setSelectedId(isSelected ? null : row.id)}
                                className={cn("cursor-pointer transition-colors", isSelected ? "bg-brand-soft/40" : "hover:bg-surface-muted")}
                              >
                                <td className={cn(cellClass, "pl-5 font-medium")}>
                                  {row.name}
                                  <p className="text-xs font-normal text-ink-muted">{organizationName(row.organizationId)}</p>
                                </td>
                                <td className={cn(cellClass, "whitespace-nowrap")}>{getSourceTypeLabel(row.sourceType)}</td>
                                <td className={cn(cellClass, "max-w-[200px] font-mono text-[13px] break-words")}>
                                  {row.profiles.join(", ") || "—"}
                                </td>
                                <td className={cn(cellClass, "text-right tabular-nums")}>{formatCount(rowStats?.total_events ?? 0)}</td>
                                <td className={cn(cellClass, "tabular-nums")}>{rowStats ? formatCount(normalizedEvents(rowStats)) : "—"}</td>
                                <td className={cn(cellClass, "tabular-nums")}>{rowStats ? formatCount(rowStats.warning_events) : "—"}</td>
                                <td className={cn(cellClass, "tabular-nums")}>{rowStats ? formatCount(rowStats.error_events) : "—"}</td>
                                <td className={cn(cellClass, "tabular-nums")}>
                                  {rowStats?.total_events ? formatPercent(rowStats.avg_coverage_percent) : "—"}
                                </td>
                                <td className={cellClass}>
                                  <div className="flex flex-col items-start gap-1">
                                    <span className="font-semibold tabular-nums">{formatPercent(rowStats ? qualityPercent(rowStats) : null)}</span>
                                    <QualityLevelBadge level={rowStats ? getQualityLevel(rowStats) : "empty"} />
                                  </div>
                                </td>
                                <td className={cn(cellClass, "pr-5")}>
                                  <SourceStateBadge enabled={row.enabled} />
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {filtered.length > 0 && (
                    <PaginationControl
                      page={currentPage}
                      limit={pageSize}
                      total={filtered.length}
                      onPageChange={setPage}
                      onLimitChange={withPageReset(setPageSize)}
                      pageSizeOptions={[10, 20, 50]}
                      itemsLabel="источников"
                      className="border-t border-line-muted bg-surface-muted px-5 py-3"
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {selectedRow && tab === "sources" && (
            <aside className="min-w-0 xl:sticky xl:top-5">
              <SourceQualityPanel
                key={selectedRow.id}
                row={selectedRow}
                params={params}
                organizationName={organizationName}
                onClose={() => setSelectedId(null)}
              />
            </aside>
          )}
        </div>
      )}
    </section>
  );
}

