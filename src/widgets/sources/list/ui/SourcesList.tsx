"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Layers, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { SelectPill } from "@/shared/ui/select-pill";
import { PaginationControl } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";
import { PageHeader, pageStackClass } from "@/shared/ui/page-header";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  SourceStatusBadge,
  SourceTag,
  getSourceTypeLabel,
  sourceKeys,
  useSources,
  type SourceType,
} from "@/entities/source";

// Вёрстка по макету «Источники» (public/images/sources.jpeg): поиск и фильтры над таблицей,
// карточка источника (detail) — справа от таблицы, таблица при этом сужается

const PAGE_SIZE = 15;
const ALL = "";
const NO_ORGANIZATION = "__none__";

type StatusFilter = "" | "enabled" | "disabled";
type SortDirection = "asc" | "desc";

function matchesSearch(source: SourceType, query: string) {
  if (!query) return true;
  return [
    source.source_id,
    source.name,
    source.description,
    source.vendor_name,
    source.product_name,
    ...(source.hostnames ?? []),
    ...(source.device_ips ?? []),
    ...(source.agent_names ?? []),
    ...(source.agent_ids ?? []),
  ].some((value) => value?.toLowerCase().includes(query));
}

const uniqueSorted = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b),
  );

const headClass = "px-2 py-3.5 text-left text-[13px] font-semibold whitespace-nowrap text-ink";
const cellClass = "px-2 py-3 text-sm text-ink";

type Props = {
  /** source_id открытого источника: строка подсвечивается, таблица становится компактной */
  selectedId?: string | null;
  /** Карточка открытого источника — показывается справа от таблицы */
  detail?: ReactNode;
};

export function SourcesList({ selectedId, detail }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, isError, isFetching, refetch } = useSources();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [organizationFilter, setOrganizationFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [idSort, setIdSort] = useState<SortDirection>("asc");

  const compact = Boolean(selectedId);
  const sources = data?.items ?? [];
  const typeOptions = uniqueSorted(sources.map((source) => source.source_type));
  const organizationOptions = uniqueSorted(sources.map((source) => source.organization_id));
  const hasSourcesWithoutOrganization = sources.some((source) => !source.organization_id);

  const query = search.trim().toLowerCase();
  const filtered = sources
    .filter((source) => matchesSearch(source, query))
    .filter((source) => !typeFilter || source.source_type === typeFilter)
    .filter((source) => {
      if (!organizationFilter) return true;
      if (organizationFilter === NO_ORGANIZATION) return !source.organization_id;
      return source.organization_id === organizationFilter;
    })
    .filter((source) => {
      if (statusFilter === "enabled") return source.enabled;
      if (statusFilter === "disabled") return !source.enabled;
      return true;
    })
    .sort(
      (a, b) => a.source_id.localeCompare(b.source_id) * (idSort === "asc" ? 1 : -1),
    );
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columnCount = 6;

  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  // Отдельного эндпоинта синхронизации нет — перезапрашиваем список, карточку и состояние источников
  const handleSync = async () => {
    await queryClient.invalidateQueries({ queryKey: sourceKeys.all });
    toast.success("Данные источников обновлены");
  };

  const filterLabel = (value: string, options: Record<string, string>) =>
    value ? options[value] ?? value : "Все";

  return (
    <section className={pageStackClass}>
      <PageHeader title="Источники" description="Источники событий, подключённые к SOC Engine" />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={withPageReset(setSearch)}
          placeholder="Поиск по ID, названию, IP, хосту или описанию"
          label="Поиск источников"
        />

        <SelectPill
          label="Тип"
          value={typeFilter}
          display={filterLabel(
            typeFilter,
            Object.fromEntries(typeOptions.map((type) => [type, getSourceTypeLabel(type)])),
          )}
          onChange={withPageReset(setTypeFilter)}
        >
          <option value={ALL}>Все</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {getSourceTypeLabel(type)}
            </option>
          ))}
        </SelectPill>

        <SelectPill
          label="Организация"
          value={organizationFilter}
          display={filterLabel(organizationFilter, { [NO_ORGANIZATION]: "Без организации" })}
          onChange={withPageReset(setOrganizationFilter)}
        >
          <option value={ALL}>Все</option>
          {organizationOptions.map((organizationId) => (
            <option key={organizationId} value={organizationId}>
              {organizationId}
            </option>
          ))}
          {hasSourcesWithoutOrganization && (
            <option value={NO_ORGANIZATION}>Без организации</option>
          )}
        </SelectPill>

        <SelectPill
          label="Статус"
          value={statusFilter}
          display={filterLabel(statusFilter, { enabled: "Активен", disabled: "Отключён" })}
          onChange={withPageReset((value: string) => setStatusFilter(value as StatusFilter))}
        >
          <option value="">Все</option>
          <option value="enabled">Активен</option>
          <option value="disabled">Отключён</option>
        </SelectPill>

        <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
          <button
            type="button"
            onClick={handleSync}
            disabled={isFetching}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-ink/85 disabled:opacity-70"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} aria-hidden />
            {isFetching ? "Синхронизация..." : "Синхронизировать"}
          </button>
          <Link
            href={routes.sourceNew}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-light px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-brand"
          >
            <Plus className="size-4" />
            Добавить источник
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "grid items-start gap-5",
          detail && "xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]",
        )}
      >
        <div className={cn("min-w-0", detail && "order-2 xl:order-1")}>
          {isError ? (
            <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
              <p className="font-semibold text-ink">Не удалось загрузить список источников</p>
              <Button variant="outline" onClick={() => refetch()}>
                Повторить попытку
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.04)]">
              <div className="overflow-x-auto">
                <table className={cn("w-full", compact ? "min-w-[620px]" : "min-w-[860px]")}>
                  <thead className="border-b border-line-muted bg-surface-muted">
                    <tr>
                      <th
                        className={cn(headClass, "pl-4")}
                        aria-sort={idSort === "asc" ? "ascending" : "descending"}
                      >
                        <button
                          type="button"
                          onClick={() => setIdSort((current) => (current === "asc" ? "desc" : "asc"))}
                          className="inline-flex items-center gap-1"
                        >
                          ID
                          <ChevronDown
                            aria-hidden
                            className={cn(
                              "size-3.5 text-ink-muted transition-transform",
                              idSort === "desc" && "rotate-180",
                            )}
                          />
                        </button>
                      </th>
                      <th className={headClass}>Название</th>
                      <th className={headClass}>Тип</th>
                      <th className={headClass}>Организация</th>
                      <th className={headClass}>Продукт</th>
                      <th className={cn(headClass, "pr-4 text-center")}>Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-muted">
                    {isPending ? (
                      Array.from({ length: 5 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="animate-pulse">
                          {Array.from({ length: columnCount }).map((__, cellIndex) => (
                            <td className="px-4 py-4" key={cellIndex}>
                              <div className="h-4 w-16 rounded bg-line-muted" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={columnCount} className="px-4 py-14 text-center text-sm text-ink-muted">
                          <Layers className="mx-auto mb-2 h-8 w-8 text-line" />
                          {sources.length ? "По заданным условиям ничего не найдено" : "Источников пока нет"}
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((source) => {
                        const href = routes.source(source.source_id);
                        const isSelected = source.source_id === selectedId;
                        return (
                          <tr
                            key={source.source_id}
                            aria-selected={isSelected || undefined}
                            onClick={() => router.push(href, { scroll: false })}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected ? "bg-brand-soft/40" : "hover:bg-surface-muted",
                            )}
                          >
                            <td className={cn(cellClass, "pl-4 whitespace-nowrap")}>
                              <Link
                                href={href}
                                scroll={false}
                                aria-current={isSelected ? "page" : undefined}
                                onClick={(event) => event.stopPropagation()}
                                className="font-medium text-[#1067c2] hover:underline"
                              >
                                {source.source_id}
                              </Link>
                            </td>
                            <td className={cn(cellClass, "max-w-[220px] break-words")}>{source.name}</td>
                            <td className={cellClass}>
                              <SourceTag>{getSourceTypeLabel(source.source_type)}</SourceTag>
                            </td>
                            <td className={cn(cellClass, "whitespace-nowrap")}>
                              {source.organization_id || "—"}
                            </td>
                            <td className={cn(cellClass, "max-w-[180px] break-words")}>
                              {source.product_name || "—"}
                            </td>
                            <td className={cn(cellClass, "pr-4 text-center")}>
                              <SourceStatusBadge enabled={source.enabled} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filtered.length > PAGE_SIZE && (
                <PaginationControl
                  page={page}
                  limit={PAGE_SIZE}
                  total={filtered.length}
                  onPageChange={setPage}
                  isLoading={isPending}
                  itemsLabel="источников"
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
    </section>
  );
}
