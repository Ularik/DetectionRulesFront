"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Copy,
  Download,
  ExternalLink,
  FileClock,
  GitCompareArrows,
  Layers,
  MoreHorizontal,
  PlusCircle,
  Power,
  RefreshCw,
  Shapes,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { copyToClipboard } from "@/shared/ui/copy-button";
import { PaginationControl } from "@/shared/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { SearchInput } from "@/shared/ui/search-input";
import { PageHeader, pageStackClass } from "@/shared/ui/page-header";
import { cn } from "@/shared/lib/utils";
import { useOrganizations } from "@/entities/organization";
import {
  EngineActionBadge,
  describeEngineAudit,
  getEngineActionLabel,
  getEngineResourceLabel,
  resolveEngineAction,
  useEngineAudits,
  type EngineAuditType,
} from "@/entities/audit";
import { exportAuditCsv, exportAuditJson } from "../lib/export";
import { formatAuditTimestamp } from "../lib/format";
import { PERIOD_PRESETS, inPeriod, periodLabel, presetPeriod, type Period } from "../lib/period";
import { getResourceHref } from "../lib/resource";
import { AuditEventPanel, type PanelTab } from "./AuditEventPanel";
import { AuditStatistics } from "./AuditStatistics";

// Вёрстка по макету «Аудит: журнал действий» (public/images/audit.jpeg), данные — GET /audits/engine.
// Ответ — массив последних `size` записей без total, поэтому фильтры, поиск и пагинация — на клиенте

const LOAD_SIZES = [100, 500, 1000, 5000];
const DEFAULT_LOAD_SIZE = 1000;

type Tab = "journal" | "stats";

function StatCard({
  icon,
  iconClass,
  cardClass,
  label,
  value,
}: {
  icon: ReactNode;
  iconClass: string;
  cardClass?: string;
  label: string;
  value: number | undefined;
}) {
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4", cardClass)}>
      <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", iconClass)}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-sm text-ink-muted">{label}</p>
        <p className="text-2xl leading-tight font-semibold text-ink tabular-nums">
          {value === undefined ? "—" : value.toLocaleString("ru-RU")}
        </p>
      </div>
    </div>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  onChange,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative flex h-11 min-w-[170px] items-center gap-1.5 rounded-xl border border-line bg-white pr-9 pl-3 text-sm text-ink focus-within:border-brand-light focus-within:ring-2 focus-within:ring-brand-light/20">
      <span className="text-ink-muted">{icon}</span>
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

function PeriodFilter({ period, onChange }: { period: Period; onChange: (period: Period) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm text-ink hover:bg-surface-muted"
        >
          <CalendarDays className="size-4 text-ink-muted" aria-hidden />
          <span className="text-ink-muted">Период:</span>
          <span className="font-medium">{periodLabel(period)}</span>
          <ChevronDown className="size-4 text-ink-muted" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 bg-white p-3">
        <div className="grid grid-cols-2 gap-1.5">
          {PERIOD_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(presetPeriod(preset.value))}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-sm transition-colors",
                period.preset === preset.value
                  ? "border-brand-light bg-[#f2f9ff] font-medium text-brand-light"
                  : "border-line text-ink hover:bg-surface-muted",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line-muted pt-3">
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            С
            <input
              type="date"
              value={period.from}
              max={period.to || undefined}
              onChange={(event) => onChange({ ...period, preset: "custom", from: event.target.value })}
              className="h-9 rounded-lg border border-line px-2 text-sm text-ink outline-none focus:border-brand-light"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            По
            <input
              type="date"
              value={period.to}
              min={period.from || undefined}
              onChange={(event) => onChange({ ...period, preset: "custom", to: event.target.value })}
              className="h-9 rounded-lg border border-line px-2 text-sm text-ink outline-none focus:border-brand-light"
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RowMenu({
  audit,
  onDetails,
  onCompare,
}: {
  audit: EngineAuditType;
  onDetails: () => void;
  onCompare: () => void;
}) {
  const [open, setOpen] = useState(false);
  const href = getResourceHref(audit.resource_type, audit.resource_id);
  const itemClass = "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-muted";
  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Действия с записью"
          onClick={(event) => event.stopPropagation()}
          className="flex size-8 items-center justify-center rounded-lg text-ink hover:bg-surface-muted"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 bg-white p-1.5" onClick={(event) => event.stopPropagation()}>
        <button type="button" className={itemClass} onClick={run(onDetails)}>
          <FileClock className="size-4" /> Подробнее
        </button>
        <button type="button" className={itemClass} onClick={run(onCompare)}>
          <GitCompareArrows className="size-4" /> Сравнить изменения
        </button>
        {href && (
          <Link href={href} className={itemClass} onClick={() => setOpen(false)}>
            <ExternalLink className="size-4" /> Открыть объект
          </Link>
        )}
        <button
          type="button"
          className={itemClass}
          onClick={run(() =>
            copyToClipboard(audit.resource_id ?? audit.audit_id).then(
              () => toast.success("ID скопирован"),
              () => toast.error("Не удалось скопировать ID"),
            ),
          )}
        >
          <Copy className="size-4" /> Копировать ID
        </button>
      </PopoverContent>
    </Popover>
  );
}

const headClass = "px-3 py-3.5 text-left text-[13px] font-semibold whitespace-nowrap text-ink";
const cellClass = "px-3 py-3 text-[13px] text-ink";
const toolbarButton =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm text-ink transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-45";

export function EngineAuditJournal() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("journal");
  const [size, setSize] = useState(DEFAULT_LOAD_SIZE);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>(() => presetPeriod("all"));
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("event");

  const { data, isPending, isError, isFetching, refetch } = useEngineAudits({ size });
  const { data: organizationsData } = useOrganizations();
  const organizationNames = useMemo(
    () => new Map((organizationsData?.items ?? []).map((item) => [item.organization_id, item.name])),
    [organizationsData],
  );
  const organizationName = (id: string | null) => (id ? organizationNames.get(id) ?? id : "—");

  const items = useMemo(() => data ?? [], [data]);
  const users = useMemo(() => [...new Set(items.map((item) => item.actor ?? "система"))].sort(), [items]);
  const actions = useMemo(() => [...new Set(items.map(getEngineActionLabel))].sort(), [items]);
  const resources = useMemo(
    () =>
      [...new Map(items.map((item) => [getEngineResourceLabel(item.resource_type), item.resource_type])).keys()].sort(),
    [items],
  );

  const query = search.trim().toLowerCase();
  const filtered = items
    .filter((item) => {
      if (!inPeriod(item.timestamp, period)) return false;
      if (userFilter && (item.actor ?? "система") !== userFilter) return false;
      if (actionFilter && getEngineActionLabel(item) !== actionFilter) return false;
      if (resourceFilter && getEngineResourceLabel(item.resource_type) !== resourceFilter) return false;
      if (query) {
        const haystack = [
          item.audit_id,
          item.actor,
          item.role,
          item.resource_id,
          item.resource_type,
          getEngineResourceLabel(item.resource_type),
          getEngineActionLabel(item),
          describeEngineAudit(item),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * sortDir);

  const counts = filtered.reduce(
    (acc, item) => {
      const kind = resolveEngineAction(item);
      if (kind === "update" || kind === "status") acc.updates += 1;
      if (kind === "create") acc.creates += 1;
      if (kind === "disable" || kind === "delete") acc.disables += 1;
      return acc;
    },
    { updates: 0, creates: 0, disables: 0 },
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedItems = items.filter((item) => selected.has(item.audit_id));
  const single = selectedItems.length === 1 ? selectedItems[0] : null;
  const singleHref = single ? getResourceHref(single.resource_type, single.resource_id) : null;
  const opened = items.find((item) => item.audit_id === openedId) ?? null;
  const allOnPage = pageItems.length > 0 && pageItems.every((item) => selected.has(item.audit_id));
  const someOnPage = pageItems.some((item) => selected.has(item.audit_id));

  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const openPanel = (auditId: string, nextTab: PanelTab = "event") => {
    setOpenedId(auditId);
    setPanelTab(nextTab);
  };

  const toggle = (auditId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(auditId)) next.delete(auditId);
      else next.add(auditId);
      return next;
    });

  const togglePage = () =>
    setSelected((current) => {
      const next = new Set(current);
      pageItems.forEach((item) => (allOnPage ? next.delete(item.audit_id) : next.add(item.audit_id)));
      return next;
    });

  const copyIds = () => {
    const ids = selectedItems.map((item) => item.resource_id ?? item.audit_id);
    copyToClipboard(ids.join("\n")).then(
      () => toast.success(ids.length === 1 ? "ID скопирован" : `Скопировано ID: ${ids.length}`),
      () => toast.error("Не удалось скопировать ID"),
    );
  };

  const exportTarget = selectedItems.length ? selectedItems : filtered;

  return (
    <section className={pageStackClass}>
      <PageHeader
        title="Аудит: журнал действий"
        description="Единый журнал изменений и административных действий в SOC Engine"
        actions={
        <div className="flex rounded-xl border border-line bg-white p-1" role="tablist">
          {(
            [
              ["journal", "Журнал"],
              ["stats", "Статистика"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "rounded-lg px-5 py-1.5 text-sm font-medium transition-colors",
                tab === value ? "bg-[#1677ff] text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={withPageReset(setSearch)}
          placeholder="Поиск по событиям (пользователь, объект, ID, описание)"
          label="Поиск по журналу аудита"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PeriodFilter period={period} onChange={withPageReset(setPeriod)} />
        <FilterSelect icon={<User className="size-4" />} label="Пользователь" value={userFilter} onChange={withPageReset(setUserFilter)}>
          <option value="">Все</option>
          {users.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect icon={<Zap className="size-4" />} label="Действие" value={actionFilter} onChange={withPageReset(setActionFilter)}>
          <option value="">Все</option>
          {actions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect icon={<Shapes className="size-4" />} label="Тип объекта" value={resourceFilter} onChange={withPageReset(setResourceFilter)}>
          <option value="">Все</option>
          {resources.map((resource) => (
            <option key={resource} value={resource}>
              {resource}
            </option>
          ))}
        </FilterSelect>
        <div className="ml-auto flex items-center gap-2">
          <label className="relative flex h-11 items-center gap-1.5 rounded-xl border border-line bg-white pr-8 pl-3 text-sm text-ink" title="Сколько последних записей загружать с сервера">
            <span className="text-ink-muted">Загружать:</span>
            <select
              value={size}
              onChange={(event) => withPageReset(setSize)(Number(event.target.value))}
              className="cursor-pointer appearance-none bg-transparent font-medium outline-none"
            >
              {LOAD_SIZES.map((option) => (
                <option key={option} value={option}>
                  {option.toLocaleString("ru-RU")}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 size-4 text-ink-muted" />
          </label>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Обновить журнал"
            title="Обновить журнал"
            className="flex size-11 items-center justify-center rounded-xl border border-line bg-white text-ink hover:bg-surface-muted disabled:opacity-60"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className={cn("grid items-start gap-5", opened && tab === "journal" && "xl:grid-cols-[minmax(0,1fr)_400px]")}>
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <StatCard
              icon={<Layers className="size-6" />}
              iconClass="bg-[#e0edff] text-[#2563eb]"
              label="Всего событий"
              value={data ? filtered.length : undefined}
            />
            <StatCard
              icon={<CircleCheck className="size-6" />}
              iconClass="bg-[#dcfce7] text-[#16a34a]"
              cardClass="bg-[#f6fdf8]"
              label="Изменения"
              value={data ? counts.updates : undefined}
            />
            <StatCard
              icon={<PlusCircle className="size-6" />}
              iconClass="bg-[#f1f5f9] text-[#475569]"
              label="Создания"
              value={data ? counts.creates : undefined}
            />
            <StatCard
              icon={<Power className="size-6" />}
              iconClass="bg-[#fee2e2] text-[#dc2626]"
              cardClass="bg-[#fff7f7]"
              label="Отключения и удаления"
              value={data ? counts.disables : undefined}
            />
          </div>

          {isError ? (
            <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
              <p className="font-semibold text-ink">Не удалось загрузить журнал аудита</p>
              <Button variant="outline" onClick={() => refetch()}>
                Повторить попытку
              </Button>
            </div>
          ) : tab === "stats" ? (
            <AuditStatistics items={filtered} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)]">
              <div className="flex flex-wrap items-center gap-2 border-b border-line-muted px-4 py-3">
                <span className="mr-1 text-sm font-semibold text-brand-light">Выбрано: {selectedItems.length}</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className={toolbarButton} disabled={!exportTarget.length}>
                      <Download className="size-4" /> Экспорт
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64 bg-white p-1.5">
                    <p className="px-2.5 py-1.5 text-xs text-ink-muted">
                      {selectedItems.length ? `Выбранные записи: ${selectedItems.length}` : `Все по фильтру: ${filtered.length}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => exportAuditCsv(exportTarget)}
                      className="flex w-full rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-muted"
                    >
                      CSV (таблица)
                    </button>
                    <button
                      type="button"
                      onClick={() => exportAuditJson(exportTarget)}
                      className="flex w-full rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-muted"
                    >
                      JSON (со снимками до / после)
                    </button>
                  </PopoverContent>
                </Popover>
                <button
                  type="button"
                  className={toolbarButton}
                  disabled={!singleHref}
                  title={single && !singleHref ? "У этого типа объекта нет своей страницы" : "Выберите одну запись"}
                  onClick={() => singleHref && router.push(singleHref)}
                >
                  <ExternalLink className="size-4" /> Открыть объект
                </button>
                <button
                  type="button"
                  className={toolbarButton}
                  disabled={!single}
                  title="Выберите одну запись"
                  onClick={() => single && openPanel(single.audit_id, "changes")}
                >
                  <GitCompareArrows className="size-4" /> Сравнить изменения
                </button>
                <button type="button" className={toolbarButton} disabled={!selectedItems.length} onClick={copyIds}>
                  <Copy className="size-4" /> Копировать ID
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="border-b border-line-muted">
                    <tr>
                      <th className="w-11 py-3.5 pr-1 pl-4 text-left">
                        <input
                          type="checkbox"
                          aria-label="Выбрать все на странице"
                          checked={allOnPage}
                          ref={(input) => {
                            if (input) input.indeterminate = someOnPage && !allOnPage;
                          }}
                          onChange={togglePage}
                          disabled={!pageItems.length}
                          className="size-4 cursor-pointer accent-brand-light"
                        />
                      </th>
                      <th className={headClass} aria-sort={sortDir === 1 ? "ascending" : "descending"}>
                        <button type="button" onClick={() => setSortDir((dir) => (dir === 1 ? -1 : 1))} className="inline-flex items-center gap-1">
                          Дата и время
                          <ChevronDown className={cn("size-3.5 transition-transform", sortDir === 1 && "rotate-180")} aria-hidden />
                        </button>
                      </th>
                      <th className={headClass}>Пользователь</th>
                      <th className={headClass}>Роль</th>
                      <th className={headClass}>Действие</th>
                      <th className={headClass}>Тип объекта</th>
                      <th className={headClass}>Объект (ID)</th>
                      <th className={headClass}>Описание</th>
                      <th className="w-12 pr-4" aria-label="Действия" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-muted">
                    {isPending ? (
                      Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="animate-pulse">
                          {Array.from({ length: 9 }).map((__, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-4 first:pl-4">
                              <div className="h-4 w-16 rounded bg-line-muted" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-14 text-center text-sm text-ink-muted">
                          <FileClock className="mx-auto mb-2 size-8 text-line" />
                          {items.length ? "По заданным условиям ничего не найдено" : "Записей аудита пока нет"}
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((item) => {
                        const kind = resolveEngineAction(item);
                        const href = getResourceHref(item.resource_type, item.resource_id);
                        const isOpened = item.audit_id === openedId;
                        const isSelected = selected.has(item.audit_id);
                        return (
                          <tr
                            key={item.audit_id}
                            aria-selected={isOpened || undefined}
                            onClick={() => openPanel(item.audit_id)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isOpened ? "bg-brand-soft/40" : isSelected ? "bg-brand-soft/20" : "hover:bg-surface-muted",
                            )}
                          >
                            <td className="py-3 pr-1 pl-4" onClick={(event) => event.stopPropagation()}>
                              <input
                                type="checkbox"
                                aria-label={`Выбрать запись ${item.audit_id}`}
                                checked={isSelected}
                                onChange={() => toggle(item.audit_id)}
                                className="size-4 cursor-pointer accent-brand-light"
                              />
                            </td>
                            <td className={cn(cellClass, "whitespace-nowrap tabular-nums")}>{formatAuditTimestamp(item.timestamp)}</td>
                            <td className={cn(cellClass, "whitespace-nowrap")}>
                              <span className="inline-flex items-center gap-1.5">
                                <User className="size-4 text-ink-muted" aria-hidden />
                                {item.actor ?? "система"}
                              </span>
                            </td>
                            <td className={cellClass}>
                              {item.role ? (
                                <span className="rounded-md bg-[#eef2f7] px-2 py-0.5 text-xs font-medium text-[#334155]">{item.role}</span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className={cellClass}>
                              <EngineActionBadge kind={kind} label={getEngineActionLabel(item)} />
                            </td>
                            <td className={cn(cellClass, "max-w-[140px]")}>{getEngineResourceLabel(item.resource_type)}</td>
                            <td className={cn(cellClass, "max-w-[160px]")}>
                              {item.resource_id ? (
                                href ? (
                                  <Link
                                    href={href}
                                    onClick={(event) => event.stopPropagation()}
                                    className="break-all text-[#1067c2] underline underline-offset-2 hover:text-brand"
                                  >
                                    {item.resource_id}
                                  </Link>
                                ) : (
                                  <span className="font-mono text-xs break-all">{item.resource_id}</span>
                                )
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className={cn(cellClass, "max-w-[280px] break-words")}>{describeEngineAudit(item)}</td>
                            <td className="py-3 pr-4 text-right">
                              <RowMenu
                                audit={item}
                                onDetails={() => openPanel(item.audit_id)}
                                onCompare={() => openPanel(item.audit_id, "changes")}
                              />
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
                  pageSizeOptions={[10, 20, 50, 100]}
                  itemsLabel="записей"
                  className="border-t border-line-muted px-4 py-3"
                />
              )}
              {data && data.length >= size && (
                <p className="border-t border-line-muted bg-surface-muted px-4 py-2 text-xs text-ink-muted">
                  Загружены последние {size.toLocaleString("ru-RU")} записей — более ранние не показаны. Увеличьте «Загружать», чтобы увидеть их.
                </p>
              )}
            </div>
          )}
        </div>

        {opened && tab === "journal" && (
          <aside className="min-w-0 xl:sticky xl:top-5">
            <AuditEventPanel
              key={opened.audit_id}
              audit={opened}
              tab={panelTab}
              onTabChange={setPanelTab}
              organizationName={organizationName}
              onClose={() => setOpenedId(null)}
            />
          </aside>
        )}
      </div>
    </section>
  );
}
