"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ChevronDown,
  CircleCheck,
  Copy,
  History,
  Layers,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  SquarePen,
  Trash2,
  TriangleAlert,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { PaginationControl } from "@/shared/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { SelectPill } from "@/shared/ui/select-pill";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  CORRELATION_SEVERITIES,
  CORRELATION_SEVERITY_LABELS,
  CorrelationSeverityBadge,
  formatWindow,
  useCorrelationRules,
  useSequenceOptions,
  type CorrelationRuleType,
  type CorrelationSeverity,
} from "@/entities/correlation-rule";
import { useSetCorrelationRuleStatus } from "@/features/correlation-rule/toggle-status";
import { DeleteCorrelationRulesDialog } from "@/features/correlation-rule/delete";

// Вёрстка по макету «Правила корреляции» (public/images/correlation-rules.jpeg): поиск, фильтры, счётчики,
// таблица с выбором строк; форма правила (detail) открывается справа

const ALL = "";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type StatusFilter = "" | "enabled" | "disabled";
type SortKey = "id" | "description" | "scenario" | "severity" | "updated" | "status";
type Sort = { key: SortKey; direction: "asc" | "desc" };

const SEVERITY_RANK = Object.fromEntries(CORRELATION_SEVERITIES.map((severity, index) => [severity, index]));

function formatDateTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (part: number) => String(part).padStart(2, "0");
  return {
    date: `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

const lastChange = (rule: CorrelationRuleType) => rule.updated_at || rule.created_at;

function matchesSearch(rule: CorrelationRuleType, query: string) {
  if (!query) return true;
  return [
    rule.correlation_id,
    rule.description,
    rule.scenario_type,
    ...rule.sequence,
    ...rule.group_by,
    ...rule.tags,
  ].some((value) => value?.toLowerCase().includes(query));
}

function sortValue(rule: CorrelationRuleType, key: SortKey): string | number {
  switch (key) {
    case "id":
      return rule.correlation_id;
    case "description":
      return rule.description ?? "";
    case "scenario":
      return rule.scenario_type;
    case "severity":
      return rule.severity ? SEVERITY_RANK[rule.severity] : -1;
    case "updated":
      return lastChange(rule) ?? "";
    case "status":
      return rule.enabled ? 1 : 0;
  }
}

const headClass = "px-2 py-3 text-left text-xs font-semibold whitespace-nowrap text-ink";
const cellClass = "px-2 py-3 text-[13px] text-ink align-middle";
const actionButtonClass =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-50";
const iconButtonClass =
  "flex size-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-white hover:text-ink";
const menuItemClass =
  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-ink hover:bg-surface-muted";

type Props = {
  /** correlation_id открытого правила — строка подсвечивается */
  selectedId?: string | null;
  /** Форма правила — справа от таблицы */
  detail?: ReactNode;
};

export function CorrelationRulesList({ selectedId, detail }: Props) {
  const router = useRouter();
  const { data: rules = [], isPending, isError, isFetching, refetch } = useCorrelationRules();
  const { data: sequenceOptions = [] } = useSequenceOptions();
  const setStatus = useSetCorrelationRuleStatus({ silent: true });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [scenarioFilter, setScenarioFilter] = useState(ALL);
  const [severityFilter, setSeverityFilter] = useState(ALL);
  const [sort, setSort] = useState<Sort>({ key: "id", direction: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const compact = Boolean(detail);
  const sequenceLabel = (value: string) =>
    sequenceOptions.find((item) => item.value === value)?.label ?? value;
  const scenarioOptions = [...new Set(rules.map((rule) => rule.scenario_type))].filter(Boolean).sort();

  const query = search.trim().toLowerCase();
  const filtered = rules
    .filter((rule) => matchesSearch(rule, query))
    .filter((rule) => !scenarioFilter || rule.scenario_type === scenarioFilter)
    .filter((rule) => !severityFilter || rule.severity === severityFilter)
    .filter((rule) => {
      if (statusFilter === "enabled") return rule.enabled;
      if (statusFilter === "disabled") return !rule.enabled;
      return true;
    })
    .sort((a, b) => {
      const left = sortValue(a, sort.key);
      const right = sortValue(b, sort.key);
      const result =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return sort.direction === "asc" ? result : -result;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Выбор хранится по correlation_id; удалённые правила из него выпадают сами
  const selectedRules = rules.filter((rule) => checked.has(rule.correlation_id));
  const pageAllChecked =
    pageItems.length > 0 && pageItems.every((rule) => checked.has(rule.correlation_id));
  const singleSelected = selectedRules.length === 1 ? selectedRules[0] : null;

  // «С предупреждениями» из макета на backend нет — 4-й счётчик показывает высокую и критическую критичность
  const stats = {
    total: rules.length,
    enabled: rules.filter((rule) => rule.enabled).length,
    disabled: rules.filter((rule) => !rule.enabled).length,
    severe: rules.filter((rule) => rule.severity === "high" || rule.severity === "critical").length,
  };

  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );

  const toggleChecked = (ruleId: string) =>
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });

  const togglePage = () =>
    setChecked((current) => {
      const next = new Set(current);
      pageItems.forEach((rule) =>
        pageAllChecked ? next.delete(rule.correlation_id) : next.add(rule.correlation_id),
      );
      return next;
    });

  const bulkSetStatus = async (enabled: boolean) => {
    const targets = selectedRules.filter((rule) => rule.enabled !== enabled);
    if (!targets.length) {
      toast.info(enabled ? "Выбранные правила уже включены" : "Выбранные правила уже отключены");
      return;
    }
    setIsBulkUpdating(true);
    const results = await Promise.allSettled(
      targets.map((rule) =>
        setStatus.mutateAsync({ correlation_id: rule.correlation_id, enabled }),
      ),
    );
    setIsBulkUpdating(false);
    const done = results.filter((result) => result.status === "fulfilled").length;
    if (done) toast.success(`${enabled ? "Включено" : "Отключено"} правил: ${done}`);
  };

  const filterLabel = (value: string, label: (value: string) => string) => (value ? label(value) : "Все");

  const columnCount = compact ? 7 : 10;

  return (
    <section className="flex min-w-0 flex-col gap-[18px]">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Правила корреляции</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Настройка логики корреляции событий для выявления инцидентов безопасности
        </p>
      </div>

      <div
        className={cn(
          "grid items-start gap-5",
          detail && "xl:grid-cols-[minmax(0,1fr)_minmax(440px,520px)]",
        )}
      >
        <div className={cn("flex min-w-0 flex-col gap-[18px]", detail && "order-2 xl:order-1")}>
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative block min-w-[240px] flex-1">
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink-muted"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => withPageReset(setSearch)(event.target.value)}
                placeholder="Поиск по правилам (ID, описание, сценарий, последовательность, теги)"
                aria-label="Поиск правил корреляции"
                className="h-11 w-full rounded-xl border border-line bg-white pr-3.5 pl-10 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
              />
            </label>
            <Link
              href={routes.correlationRuleNew}
              scroll={false}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-light px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-brand"
            >
              <Plus className="size-4" />
              Создать правило
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SelectPill
              label="Статус"
              icon={<Activity aria-hidden className="size-4 text-ink-muted" />}
              value={statusFilter}
              display={filterLabel(statusFilter, (value) => (value === "enabled" ? "Активен" : "Отключён"))}
              onChange={withPageReset((value: string) => setStatusFilter(value as StatusFilter))}
            >
              <option value="">Все</option>
              <option value="enabled">Активен</option>
              <option value="disabled">Отключён</option>
            </SelectPill>
            <SelectPill
              label="Сценарий"
              icon={<Workflow aria-hidden className="size-4 text-ink-muted" />}
              value={scenarioFilter}
              display={filterLabel(scenarioFilter, (value) => value)}
              onChange={withPageReset(setScenarioFilter)}
            >
              <option value={ALL}>Все</option>
              {scenarioOptions.map((scenario) => (
                <option key={scenario} value={scenario}>
                  {scenario}
                </option>
              ))}
            </SelectPill>
            <SelectPill
              label="Критичность"
              icon={<SlidersHorizontal aria-hidden className="size-4 text-ink-muted" />}
              value={severityFilter}
              display={filterLabel(
                severityFilter,
                (value) => CORRELATION_SEVERITY_LABELS[value as CorrelationSeverity] ?? value,
              )}
              onChange={withPageReset(setSeverityFilter)}
            >
              <option value={ALL}>Все</option>
              {CORRELATION_SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {CORRELATION_SEVERITY_LABELS[severity]}
                </option>
              ))}
            </SelectPill>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Обновить список"
              title="Обновить список"
              className="ml-auto flex size-11 items-center justify-center rounded-xl border border-line bg-white text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-60"
            >
              <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={Layers} tone="blue" label="Всего правил" value={stats.total} loading={isPending} />
            <StatCard icon={CircleCheck} tone="green" label="Активных" value={stats.enabled} loading={isPending} />
            <StatCard icon={Pause} tone="gray" label="Отключённых" value={stats.disabled} loading={isPending} />
            <StatCard
              icon={TriangleAlert}
              tone="amber"
              label="Высокая и критическая"
              value={stats.severe}
              loading={isPending}
            />
          </div>

          {isError ? (
            <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
              <p className="font-semibold text-ink">Не удалось загрузить правила корреляции</p>
              <Button variant="outline" onClick={() => refetch()}>
                Повторить попытку
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center gap-2 border-b border-line-muted px-4 py-3">
                <span className="mr-2 text-[13px] font-semibold text-brand-light">
                  Выбрано: {selectedRules.length}
                </span>
                <button
                  type="button"
                  disabled={!singleSelected}
                  title={singleSelected ? undefined : "Выберите одно правило"}
                  onClick={() =>
                    singleSelected &&
                    router.push(routes.correlationRuleTest(singleSelected.correlation_id), { scroll: false })
                  }
                  className={actionButtonClass}
                >
                  <Play className="size-4" /> Тестировать
                </button>
                <button
                  type="button"
                  disabled={!selectedRules.length || isBulkUpdating}
                  onClick={() => bulkSetStatus(true)}
                  className={actionButtonClass}
                >
                  <Power className="size-4" /> Включить
                </button>
                <button
                  type="button"
                  disabled={!selectedRules.length || isBulkUpdating}
                  onClick={() => bulkSetStatus(false)}
                  className={actionButtonClass}
                >
                  <Power className="size-4" /> Отключить
                </button>
                <button
                  type="button"
                  disabled={!selectedRules.length}
                  onClick={() => setDeleteIds(selectedRules.map((rule) => rule.correlation_id))}
                  className={actionButtonClass}
                >
                  <Trash2 className="size-4" /> Удалить
                </button>
                <button
                  type="button"
                  disabled={!singleSelected}
                  title={singleSelected ? undefined : "Выберите одно правило"}
                  onClick={() =>
                    singleSelected &&
                    router.push(routes.correlationRuleCopy(singleSelected.correlation_id), { scroll: false })
                  }
                  className={actionButtonClass}
                >
                  <Copy className="size-4" /> Копировать
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className={cn("w-full", compact ? "min-w-[640px]" : "min-w-[1100px]")}>
                  <thead className="border-b border-line-muted bg-surface-muted">
                    <tr>
                      <th className="w-10 py-3 pr-1 pl-4">
                        <input
                          type="checkbox"
                          checked={pageAllChecked}
                          onChange={togglePage}
                          aria-label="Выбрать все правила на странице"
                          className="size-4 accent-brand-light"
                        />
                      </th>
                      <SortHead sort={sort} onSort={toggleSort} sortKey="id">ID</SortHead>
                      <SortHead sort={sort} onSort={toggleSort} sortKey="description">Название</SortHead>
                      <SortHead sort={sort} onSort={toggleSort} sortKey="scenario">Сценарий</SortHead>
                      {!compact && <th className={headClass}>Условия / последовательность</th>}
                      {!compact && <th className={headClass}>Group by</th>}
                      <SortHead sort={sort} onSort={toggleSort} sortKey="severity">Критичность</SortHead>
                      {!compact && (
                        <SortHead sort={sort} onSort={toggleSort} sortKey="updated">
                          Последнее изменение
                        </SortHead>
                      )}
                      <SortHead sort={sort} onSort={toggleSort} sortKey="status">Статус</SortHead>
                      <th className={cn(headClass, "pr-4 text-center")}>
                        <span className="sr-only">Действия</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-muted">
                    {isPending ? (
                      Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="animate-pulse">
                          {Array.from({ length: columnCount }).map((__, cellIndex) => (
                            <td className="px-3 py-4" key={cellIndex}>
                              <div className="h-4 w-14 rounded bg-line-muted" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={columnCount} className="px-4 py-14 text-center text-sm text-ink-muted">
                          <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-line" />
                          {rules.length ? "По заданным условиям ничего не найдено" : "Правил корреляции пока нет"}
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((rule) => {
                        const isSelected = rule.correlation_id === selectedId;
                        const isChecked = checked.has(rule.correlation_id);
                        const changedAt = formatDateTime(lastChange(rule));
                        return (
                          <tr
                            key={rule.correlation_id}
                            aria-selected={isSelected || undefined}
                            onClick={() =>
                              router.push(routes.correlationRule(rule.correlation_id), { scroll: false })
                            }
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected
                                ? "bg-brand-soft/40"
                                : isChecked
                                  ? "bg-[#f2f9ff]"
                                  : "hover:bg-surface-muted",
                            )}
                          >
                            <td className="py-3 pr-1 pl-4" onClick={(event) => event.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleChecked(rule.correlation_id)}
                                aria-label={`Выбрать правило ${rule.correlation_id}`}
                                className="size-4 accent-brand-light"
                              />
                            </td>
                            <td className={cn(cellClass, "font-medium whitespace-nowrap")}>
                              {rule.correlation_id}
                            </td>
                            <td className={cn(cellClass, "max-w-[220px]")}>
                              <span className="line-clamp-3 break-words" title={rule.description ?? undefined}>
                                {rule.description || "—"}
                              </span>
                            </td>
                            <td className={cn(cellClass, "max-w-[180px] font-mono text-xs break-words")}>
                              {rule.scenario_type}
                            </td>
                            {!compact && (
                              <td className={cn(cellClass, "max-w-[260px]")}>
                                <SequenceSummary rule={rule} label={sequenceLabel} />
                              </td>
                            )}
                            {!compact && (
                              <td className={cn(cellClass, "max-w-[140px] font-mono text-xs break-words")}>
                                {rule.group_by.length ? rule.group_by.join(", ") : "—"}
                              </td>
                            )}
                            <td className={cn(cellClass, "whitespace-nowrap")}>
                              <CorrelationSeverityBadge severity={rule.severity} />
                            </td>
                            {!compact && (
                              <td className={cn(cellClass, "whitespace-nowrap")}>
                                {changedAt ? (
                                  <>
                                    {changedAt.date}
                                    <br />
                                    <span className="text-ink-muted">{changedAt.time}</span>
                                  </>
                                ) : (
                                  "—"
                                )}
                              </td>
                            )}
                            <td className={cn(cellClass, "whitespace-nowrap")}>
                              <StatusPill enabled={rule.enabled} />
                            </td>
                            <td className={cn(cellClass, "pr-4")} onClick={(event) => event.stopPropagation()}>
                              <div className="flex items-center justify-center gap-0.5">
                                {!compact && (
                                  <Link
                                    href={routes.correlationRule(rule.correlation_id)}
                                    scroll={false}
                                    aria-label={`Редактировать правило ${rule.correlation_id}`}
                                    className={iconButtonClass}
                                  >
                                    <SquarePen className="size-4" />
                                  </Link>
                                )}
                                <RowMenu
                                  rule={rule}
                                  onToggle={() =>
                                    setStatus.mutate(
                                      { correlation_id: rule.correlation_id, enabled: !rule.enabled },
                                      {
                                        onSuccess: (updated) =>
                                          toast.success(
                                            `Правило ${updated.correlation_id} ${updated.enabled ? "включено" : "отключено"}`,
                                          ),
                                      },
                                    )
                                  }
                                  onDelete={() => setDeleteIds([rule.correlation_id])}
                                />
                              </div>
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
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  isLoading={isPending}
                  itemsLabel="правил"
                  className="border-t border-line-muted bg-surface-muted px-4 py-3"
                />
              )}
            </div>
          )}
        </div>

        {detail && (
          <aside className="order-1 min-w-0 xl:sticky xl:top-5 xl:order-2 xl:max-h-[calc(100vh-40px)] xl:overflow-y-auto">
            {detail}
          </aside>
        )}
      </div>

      <DeleteCorrelationRulesDialog
        ruleIds={deleteIds}
        open={deleteIds.length > 0}
        onOpenChange={(open) => !open && setDeleteIds([])}
        onDeleted={(deleted) => {
          setChecked((current) => {
            const next = new Set(current);
            deleted.forEach((ruleId) => next.delete(ruleId));
            return next;
          });
          if (selectedId && deleted.includes(selectedId)) {
            router.push(routes.correlationRules, { scroll: false });
          }
        }}
      />
    </section>
  );
}

/** «ssh_bruteforce → successful_login» и «за 10 минут · ≥ 2 категорий» */
function SequenceSummary({
  rule,
  label,
}: {
  rule: CorrelationRuleType;
  label: (value: string) => string;
}) {
  const chain = rule.sequence.map(label).join(" → ");
  return (
    <span className="flex flex-col gap-0.5" title={chain}>
      <span className="line-clamp-2 font-mono text-xs break-words">{chain || "—"}</span>
      <span className="text-xs text-ink-muted">
        за {formatWindow(rule.window_seconds)}
        {rule.min_unique_categories ? ` · ≥ ${rule.min_unique_categories} категорий` : ""}
      </span>
    </span>
  );
}

function SortHead({
  sortKey,
  sort,
  onSort,
  children,
}: {
  sortKey: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
  children: ReactNode;
}) {
  const active = sort.key === sortKey;
  return (
    <th
      className={headClass}
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
    >
      <button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1">
        {children}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-3.5 transition-transform",
            active ? "text-ink" : "text-ink-muted/60",
            active && sort.direction === "desc" && "rotate-180",
          )}
        />
      </button>
    </th>
  );
}

const STAT_TONES = {
  blue: "bg-[#eef5ff] text-[#2165aa]",
  green: "bg-emerald-50 text-emerald-600",
  gray: "bg-gray-100 text-gray-600",
  amber: "bg-amber-50 text-amber-500",
} as const;

const STAT_CARD_TONES = {
  blue: "border-line bg-white",
  green: "border-emerald-100 bg-emerald-50/40",
  gray: "border-line bg-white",
  amber: "border-amber-100 bg-amber-50/40",
} as const;

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  loading,
}: {
  icon: LucideIcon;
  tone: keyof typeof STAT_TONES;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border px-5 py-4", STAT_CARD_TONES[tone])}>
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", STAT_TONES[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] text-ink-muted">{label}</p>
        <p className="text-2xl font-semibold text-ink">
          {loading ? "…" : value.toLocaleString("ru-RU")}
        </p>
      </div>
    </div>
  );
}

// Бейдж статуса — как в таблицах «Источники» и «Правила обнаружения»
function StatusPill({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[70px] justify-center rounded-[10px] px-2 text-xs leading-[18px] font-medium text-ink",
        enabled ? "bg-[#b7e9ba]" : "bg-[#fde2e2] text-red-700",
      )}
    >
      {enabled ? "Активен" : "Отключён"}
    </span>
  );
}

function RowMenu({
  rule,
  onToggle,
  onDelete,
}: {
  rule: CorrelationRuleType;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Действия с правилом ${rule.correlation_id}`}
          className={iconButtonClass}
        >
          <MoreHorizontal className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 bg-white p-1">
        <Link href={routes.correlationRuleTest(rule.correlation_id)} scroll={false} className={menuItemClass}>
          <Play className="size-4" /> Тестировать
        </Link>
        <Link href={routes.correlationRuleCopy(rule.correlation_id)} scroll={false} className={menuItemClass}>
          <Copy className="size-4" /> Копировать
        </Link>
        <Link href={routes.correlationRuleHistory(rule.correlation_id)} scroll={false} className={menuItemClass}>
          <History className="size-4" /> История изменений
        </Link>
        <button type="button" onClick={run(onToggle)} className={menuItemClass}>
          <Power className="size-4" /> {rule.enabled ? "Отключить" : "Включить"}
        </button>
        <button type="button" onClick={run(onDelete)} className={cn(menuItemClass, "text-red-600")}>
          <Trash2 className="size-4" /> Удалить
        </button>
      </PopoverContent>
    </Popover>
  );
}
