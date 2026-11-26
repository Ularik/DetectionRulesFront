"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronsUpDown, EllipsisVertical, Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageHeader, pageStackClass } from "@/shared/ui/page-header";
import { SearchInput } from "@/shared/ui/search-input";
import { PaginationControl } from "@/shared/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  OrganizationStatusBadge,
  OrganizationTag,
  useOrganizations,
  type Organization,
} from "@/entities/organization";
import { DeleteOrganizationButton } from "@/features/organization-delete";

// Вёрстка по фрейму «Organization» макета CERT-KG SIEM (Figma 640:11556).
// При открытой организации таблица сужается: псевдонимы, агенты и хосты видны в панели справа

const PAGE_SIZE = 10;

type SortKey = "agents" | "hosts" | "status";
type SortState = { key: SortKey; direction: "asc" | "desc" } | null;

function getSortValue(organization: Organization, key: SortKey) {
  switch (key) {
    case "agents":
      return organization.agent_names?.length ?? 0;
    case "hosts":
      return organization.hostnames?.length ?? 0;
    case "status":
      return organization.enabled ? 1 : 0;
  }
}

function matchesSearch(organization: Organization, query: string) {
  if (!query) return true;
  return [
    organization.name,
    organization.organization_id,
    ...(organization.aliases ?? []),
    ...(organization.agent_names ?? []),
    ...(organization.hostnames ?? []),
  ].some((value) => value?.toLowerCase().includes(query));
}

const headClass = "px-2 py-3.5 text-center text-[13px] font-semibold whitespace-nowrap text-ink";
const cellClass = "px-2 py-3 text-center text-sm text-ink";

function Tags({ values }: { values?: string[] }) {
  if (!values?.length) return <span>-</span>;
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {values.map((value) => (
        <OrganizationTag key={value}>{value}</OrganizationTag>
      ))}
    </div>
  );
}

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
}) {
  const isSorted = sort?.key === sortKey;
  return (
    <th
      className={headClass}
      aria-sort={isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5"
      >
        {label}
        <ChevronsUpDown
          className={cn("size-3.5", isSorted ? "text-brand-light" : "text-ink-muted")}
          aria-hidden
        />
      </button>
    </th>
  );
}

function RowActions({ organization }: { organization: Organization }) {
  const itemClass =
    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink transition-colors hover:bg-surface-muted";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Действия с организацией ${organization.name}`}
          className="flex size-7 items-center justify-center rounded-md text-ink hover:bg-white"
        >
          <EllipsisVertical className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        <Link
          href={routes.organization(organization.organization_id)}
          scroll={false}
          className={itemClass}
        >
          <Eye className="size-4" />
          Подробнее
        </Link>
        <Link href={routes.organizationEdit(organization.organization_id)} className={itemClass}>
          <Pencil className="size-4" />
          Редактировать
        </Link>
        <DeleteOrganizationButton organization={organization} variant="menu" />
      </PopoverContent>
    </Popover>
  );
}

type Props = {
  /** organization_id открытой организации: строка подсвечивается, таблица становится компактной */
  selectedId?: string | null;
  /** Карточка организации — открывается справа от таблицы */
  detail?: ReactNode;
};

export function OrganizationsList({ selectedId, detail }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>(null);
  const { data, isPending, isError, refetch } = useOrganizations();
  const compact = Boolean(selectedId);

  const query = search.trim().toLowerCase();
  const filtered = (data?.items ?? []).filter((organization) => matchesSearch(organization, query));
  const sorted = sort
    ? [...filtered].sort(
        (a, b) =>
          (getSortValue(a, sort.key) - getSortValue(b, sort.key)) *
          (sort.direction === "asc" ? 1 : -1),
      )
    : filtered;
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columnCount = compact ? 5 : 8;

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current?.key === key && current.direction === "desc"
        ? { key, direction: "asc" }
        : { key, direction: "desc" },
    );
    setPage(1);
  };

  return (
    <section className={pageStackClass}>
      <PageHeader title="Организации" description="Организации, их агенты, хосты и псевдонимы" />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Поиск по организациям, алиасам, хостам ..."
          label="Поиск организаций"
        />
        <Link
          href={routes.organizationNew}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-light px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-brand"
        >
          <Plus className="size-4" />
          Добавить организацию
        </Link>
      </div>

      <div className={cn("grid items-start gap-5", detail && "xl:grid-cols-[minmax(0,1fr)_422px]")}>
      <div className={cn("min-w-0", detail && "order-2 xl:order-1")}>
      {isError ? (
        <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">Не удалось загрузить список организаций</p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_24px_-12px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className={cn("w-full", compact ? "min-w-[560px]" : "min-w-[1000px]")}>
              <thead className="border-b border-line-muted bg-surface-muted">
                <tr>
                  <th className={cn(headClass, "w-12 pl-4 text-left")}>№</th>
                  <th className={headClass}>Наименование</th>
                  <th className={headClass}>ID организации</th>
                  {!compact && <th className={headClass}>Псевдонимы</th>}
                  {!compact && (
                    <SortableHead label="Агенты" sortKey="agents" sort={sort} onSort={toggleSort} />
                  )}
                  {!compact && (
                    <SortableHead label="Хосты" sortKey="hosts" sort={sort} onSort={toggleSort} />
                  )}
                  <SortableHead label="Статус" sortKey="status" sort={sort} onSort={toggleSort} />
                  <th className="w-12 pr-4">
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-muted">
                {isPending ? (
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="animate-pulse">
                      {Array.from({ length: columnCount }).map((__, cellIndex) => (
                        <td className="px-4 py-4" key={cellIndex}>
                          <div className="mx-auto h-4 w-16 rounded bg-line-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={columnCount} className="px-4 py-14 text-center text-sm text-ink-muted">
                      <Building2 className="mx-auto mb-2 h-8 w-8 text-line" />
                      {query ? "По запросу ничего не найдено" : "Организации не найдены"}
                    </td>
                  </tr>
                ) : (
                  pageItems.map((organization, index) => {
                    const href = routes.organization(organization.organization_id);
                    const isSelected = organization.organization_id === selectedId;
                    return (
                      <tr
                        key={organization.organization_id}
                        aria-selected={isSelected || undefined}
                        onClick={() => router.push(href, { scroll: false })}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-brand-soft/40" : "hover:bg-white",
                        )}
                      >
                        <td className={cn(cellClass, "pl-4 text-left font-semibold text-black")}>
                          {(page - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className={cn(cellClass, "max-w-[200px] break-words")}>
                          <Link
                            href={href}
                            scroll={false}
                            aria-current={isSelected ? "page" : undefined}
                            onClick={(event) => event.stopPropagation()}
                            className="hover:underline"
                          >
                            {organization.name}
                          </Link>
                        </td>
                        <td className={cn(cellClass, "whitespace-nowrap")}>
                          {organization.organization_id}
                        </td>
                        {!compact && (
                          <td className={cellClass}>
                            <Tags values={organization.aliases} />
                          </td>
                        )}
                        {!compact && (
                          <td className={cellClass}>
                            <Tags values={organization.agent_names} />
                          </td>
                        )}
                        {!compact && (
                          <td className={cellClass}>
                            <Tags values={organization.hostnames} />
                          </td>
                        )}
                        <td className={cellClass}>
                          <OrganizationStatusBadge enabled={organization.enabled} />
                        </td>
                        <td className="py-3 pr-4" onClick={(event) => event.stopPropagation()}>
                          <RowActions organization={organization} />
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
            total={sorted.length}
            onPageChange={setPage}
            isLoading={isPending}
            itemsLabel="организаций"
            className="border-t border-line-muted bg-surface-muted px-4 py-3"
          />
        </div>
      )}
      </div>
      {detail && (
        <aside className="order-1 xl:sticky xl:top-5 xl:order-2 xl:max-h-[calc(100vh-40px)] xl:overflow-y-auto">
          {detail}
        </aside>
      )}
      </div>
    </section>
  );
}
