"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Plus, Server, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { SearchInput } from "@/shared/ui/search-input";
import { PageHeader, pageStackClass } from "@/shared/ui/page-header";
import { cn } from "@/shared/lib/utils";
import { useOrganizations } from "@/entities/organization";
import {
  ASSET_CRITICALITIES,
  ASSET_CRITICALITY_LABELS,
  ASSET_TYPES,
  ASSET_TYPE_LABELS,
  AssetCriticalityBadge,
  AssetStatusBadge,
  getAssetEnvironmentLabel,
  getAssetTypeLabel,
  useAssets,
  type Asset,
} from "@/entities/asset";
import { AssetFormDialog } from "@/features/asset/upsert";
import { useDeleteAssets } from "@/features/asset/delete";
import { exportAssetsCsv } from "../lib/exportCsv";
import { getPageItems } from "../lib/pages";
import { AssetRowMenu } from "./AssetRowMenu";
import { AssetStats } from "./AssetStats";

// Вёрстка по макету «Asset Inventory» (public/images/assets.jpeg). В ответе /assets нет ОС, ответственного
// и даты обновления — вместо них колонки «Среда» и «Теги»

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const NO_ORGANIZATION = "__none__";

type StatusFilter = "" | "enabled" | "disabled";

/** Актив требует внимания: он включён, но не привязан к организации или у него не указан тип */
const needsAttention = (asset: Asset) => asset.enabled && (!asset.organization_id || !asset.asset_type);

function matchesSearch(asset: Asset, query: string, organizationName: string) {
  if (!query) return true;
  return [
    asset.asset_id,
    asset.name,
    asset.ip,
    asset.description,
    organizationName,
    ...asset.hostnames,
    ...asset.tags,
  ].some((value) => value?.toLowerCase().includes(query));
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
    <label className="flex min-w-[150px] flex-1 flex-col gap-1.5 sm:flex-none">
      <span className="text-xs font-semibold text-ink">{label}:</span>
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-white pr-9 pl-3.5 text-sm text-ink outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20 sm:w-[160px]"
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
        />
      </span>
    </label>
  );
}

const headClass = "px-3 py-3.5 text-left text-[13px] font-semibold whitespace-nowrap text-ink";
const cellClass = "px-3 py-3 text-sm text-ink";
const checkboxClass = "size-4 cursor-pointer rounded border-line accent-brand-light";
const pageButtonClass =
  "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm transition-colors disabled:pointer-events-none disabled:opacity-40";

export function AssetsList() {
  const { data, isPending, isError, refetch } = useAssets();
  const { data: organizationsData } = useOrganizations();
  const { confirmAndDelete, isPending: isDeleting } = useDeleteAssets();

  const [search, setSearch] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);

  const assets = useMemo(() => data?.items ?? [], [data]);

  const organizationNames = useMemo(
    () =>
      new Map(
        (organizationsData?.items ?? []).map((organization) => [
          organization.organization_id,
          organization.name,
        ]),
      ),
    [organizationsData],
  );
  const organizationName = (organizationId: string | null) =>
    organizationId ? organizationNames.get(organizationId) ?? organizationId : "—";

  // В фильтре — организации из справочника и те, что встречаются у активов
  const organizationOptions = useMemo(() => {
    const ids = new Set([
      ...organizationNames.keys(),
      ...assets.map((asset) => asset.organization_id).filter((id): id is string => Boolean(id)),
    ]);
    return [...ids]
      .map((id) => ({ id, name: organizationNames.get(id) ?? id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [assets, organizationNames]);
  const hasAssetsWithoutOrganization = assets.some((asset) => !asset.organization_id);

  const query = search.trim().toLowerCase();
  const filtered = assets.filter((asset) => {
    if (!matchesSearch(asset, query, organizationName(asset.organization_id))) return false;
    if (organizationFilter === NO_ORGANIZATION) {
      if (asset.organization_id) return false;
    } else if (organizationFilter && asset.organization_id !== organizationFilter) {
      return false;
    }
    if (typeFilter && asset.asset_type !== typeFilter) return false;
    if (criticalityFilter && asset.criticality !== criticalityFilter) return false;
    if (statusFilter === "enabled" && !asset.enabled) return false;
    if (statusFilter === "disabled" && asset.enabled) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstItem = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(currentPage * pageSize, filtered.length);

  const selectedAssets = assets.filter((asset) => selected.has(asset.asset_id));
  const allOnPageSelected = pageItems.length > 0 && pageItems.every((asset) => selected.has(asset.asset_id));
  const someOnPageSelected = pageItems.some((asset) => selected.has(asset.asset_id));

  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const toggleSelected = (assetId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });

  const togglePageSelected = () =>
    setSelected((current) => {
      const next = new Set(current);
      pageItems.forEach((asset) =>
        allOnPageSelected ? next.delete(asset.asset_id) : next.add(asset.asset_id),
      );
      return next;
    });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setFormOpen(true);
  };

  const handleDelete = (targets: Asset[]) =>
    confirmAndDelete(targets, () =>
      setSelected((current) => {
        const next = new Set(current);
        targets.forEach((asset) => next.delete(asset.asset_id));
        return next;
      }),
    );

  const columnCount = 10;

  return (
    <section className={pageStackClass}>
      <PageHeader
        title="Активы"
        description="Учёт информационных активов организаций, их параметры, критичность и статус"
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={withPageReset(setSearch)}
          placeholder="Поиск по имени, IP, ID, хосту, тегам…"
          label="Поиск активов"
        />
        {selectedAssets.length > 0 && (
          <button
            type="button"
            onClick={() => handleDelete(selectedAssets)}
            disabled={isDeleting}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold whitespace-nowrap text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="size-4" />
            Удалить ({selectedAssets.length})
          </button>
        )}
        <button
          type="button"
          onClick={() => exportAssetsCsv(filtered, organizationName)}
          disabled={!filtered.length}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold whitespace-nowrap text-ink transition-colors hover:bg-surface-muted disabled:opacity-50"
        >
          <Download className="size-4 text-brand-light" />
          Экспорт
        </button>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1677ff] px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-brand-light"
        >
          <Plus className="size-4" />
          Добавить актив
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect label="Организация" value={organizationFilter} onChange={withPageReset(setOrganizationFilter)}>
          <option value="">Все</option>
          {organizationOptions.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
          {hasAssetsWithoutOrganization && <option value={NO_ORGANIZATION}>Без организации</option>}
        </FilterSelect>

        <FilterSelect label="Тип актива" value={typeFilter} onChange={withPageReset(setTypeFilter)}>
          <option value="">Все</option>
          {ASSET_TYPES.map((type) => (
            <option key={type} value={type}>
              {ASSET_TYPE_LABELS[type]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Критичность" value={criticalityFilter} onChange={withPageReset(setCriticalityFilter)}>
          <option value="">Все</option>
          {ASSET_CRITICALITIES.map((criticality) => (
            <option key={criticality} value={criticality}>
              {ASSET_CRITICALITY_LABELS[criticality]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Статус"
          value={statusFilter}
          onChange={withPageReset((value: string) => setStatusFilter(value as StatusFilter))}
        >
          <option value="">Все</option>
          <option value="enabled">Активен</option>
          <option value="disabled">Неактивен</option>
        </FilterSelect>
      </div>

      <AssetStats
        total={data ? assets.length : undefined}
        active={data ? assets.filter((asset) => asset.enabled).length : undefined}
        attention={data ? assets.filter(needsAttention).length : undefined}
        inactive={data ? assets.filter((asset) => !asset.enabled).length : undefined}
      />

      {isError ? (
        <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">Не удалось загрузить реестр активов</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px]">
              <thead className="border-b border-line-muted">
                <tr>
                  <th className="w-12 py-3.5 pr-1 pl-5 text-left">
                    <input
                      type="checkbox"
                      aria-label="Выбрать все на странице"
                      checked={allOnPageSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someOnPageSelected && !allOnPageSelected;
                      }}
                      onChange={togglePageSelected}
                      disabled={!pageItems.length}
                      className={checkboxClass}
                    />
                  </th>
                  <th className={headClass}>Имя актива</th>
                  <th className={headClass}>IP-адрес</th>
                  <th className={headClass}>Организация</th>
                  <th className={headClass}>Тип</th>
                  <th className={headClass}>Критичность</th>
                  <th className={headClass}>Статус</th>
                  <th className={headClass}>Среда</th>
                  <th className={headClass}>Теги</th>
                  <th className="w-14 pr-4" aria-label="Действия" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line-muted">
                {isPending ? (
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="animate-pulse">
                      {Array.from({ length: columnCount }).map((__, cellIndex) => (
                        <td className="px-3 py-4 first:pl-5" key={cellIndex}>
                          <div className="h-4 w-16 rounded bg-line-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={columnCount} className="px-4 py-14 text-center text-sm text-ink-muted">
                      <Server className="mx-auto mb-2 size-8 text-line" />
                      {assets.length ? "По заданным условиям ничего не найдено" : "Активов пока нет"}
                    </td>
                  </tr>
                ) : (
                  pageItems.map((asset) => {
                    const isSelected = selected.has(asset.asset_id);
                    return (
                      <tr
                        key={asset.asset_id}
                        aria-selected={isSelected || undefined}
                        className={cn(
                          "transition-colors",
                          isSelected ? "bg-brand-soft/30" : "hover:bg-surface-muted",
                        )}
                      >
                        <td className="py-3 pr-1 pl-5">
                          <input
                            type="checkbox"
                            aria-label={`Выбрать ${asset.name}`}
                            checked={isSelected}
                            onChange={() => toggleSelected(asset.asset_id)}
                            className={checkboxClass}
                          />
                        </td>
                        <td className={cellClass}>
                          <button
                            type="button"
                            onClick={() => openEdit(asset)}
                            title={asset.description ?? undefined}
                            className="text-left font-medium hover:text-brand-light hover:underline"
                          >
                            {asset.name}
                          </button>
                          <p className="text-xs text-ink-muted">{asset.asset_id}</p>
                        </td>
                        <td className={cn(cellClass, "font-mono text-[13px] whitespace-nowrap")}>
                          {asset.ip}
                          {asset.hostnames.length > 0 && (
                            <p className="font-sans text-xs text-ink-muted">{asset.hostnames.join(", ")}</p>
                          )}
                        </td>
                        <td className={cn(cellClass, "max-w-[180px] break-words")}>
                          {asset.organization_id ? (
                            organizationName(asset.organization_id)
                          ) : (
                            <span className="text-[#d97706]">Не указана</span>
                          )}
                        </td>
                        <td className={cn(cellClass, "whitespace-nowrap")}>
                          {getAssetTypeLabel(asset.asset_type)}
                        </td>
                        <td className={cellClass}>
                          <AssetCriticalityBadge criticality={asset.criticality} />
                        </td>
                        <td className={cellClass}>
                          <AssetStatusBadge enabled={asset.enabled} />
                        </td>
                        <td className={cn(cellClass, "whitespace-nowrap")}>
                          {getAssetEnvironmentLabel(asset.environment)}
                        </td>
                        <td className={cn(cellClass, "max-w-[220px]")}>
                          {asset.tags.length ? (
                            <div className="flex flex-wrap gap-1">
                              {asset.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-[#eef2f7] px-1.5 text-xs leading-5 text-ink-muted"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <AssetRowMenu
                            assetName={asset.name}
                            onEdit={() => openEdit(asset)}
                            onDelete={() => handleDelete([asset])}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isPending && filtered.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-line-muted px-5 py-4 md:flex-row">
              <p className="text-sm text-ink">
                Показано {firstItem} – {lastItem} из {filtered.length.toLocaleString("ru-RU")}
              </p>

              <nav aria-label="Страницы" className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Предыдущая страница"
                  className={cn(pageButtonClass, "text-ink hover:bg-surface-muted")}
                >
                  <ChevronLeft className="size-4" />
                </button>
                {getPageItems(currentPage, totalPages).map((item, index) =>
                  item === null ? (
                    <span key={`gap-${index}`} className="px-1 text-sm text-ink-muted">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      aria-current={item === currentPage ? "page" : undefined}
                      className={cn(
                        pageButtonClass,
                        item === currentPage
                          ? "bg-[#e0edff] font-semibold text-[#1677ff]"
                          : "text-ink hover:bg-surface-muted",
                      )}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Следующая страница"
                  className={cn(pageButtonClass, "text-ink hover:bg-surface-muted")}
                >
                  <ChevronRight className="size-4" />
                </button>
              </nav>

              <label className="flex items-center gap-3 text-sm text-ink">
                На странице:
                <span className="relative">
                  <select
                    value={pageSize}
                    onChange={(event) => withPageReset(setPageSize)(Number(event.target.value))}
                    className="h-11 w-20 cursor-pointer appearance-none rounded-xl border border-line bg-white pr-8 pl-3.5 text-sm outline-none focus:border-brand-light"
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-muted"
                  />
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      <AssetFormDialog open={formOpen} onOpenChange={setFormOpen} asset={editing} />
    </section>
  );
}
