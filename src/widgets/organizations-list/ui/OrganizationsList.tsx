"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, SquareMinus, SquarePlus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PaginationControl } from "@/shared/ui/pagination";
import { useOrganizations } from "@/entities/organization";
import { routes } from "@/shared/config";

const PAGE_SIZE = 10;

const columns = ["Название", "ID", "Псевдонимы", "Агенты", "Хосты", "Статус"];

const cellClass = "px-1.5 py-3 text-sm text-ink";

function Tags({ values }: { values?: string[] }) {
  if (!values?.length) return <span className="text-ink-muted">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <span
          key={value}
          className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] text-ink"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 px-6 py-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className={`break-words text-ink ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export function OrganizationsList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isPending, isError, refetch } = useOrganizations();
  const query = search.trim().toLowerCase();
  const items = (data?.items ?? []).filter(
    (organization) =>
      !query ||
      [
        organization.name,
        organization.organization_id,
        ...(organization.aliases ?? []),
        ...(organization.agent_names ?? []),
        ...(organization.hostnames ?? []),
      ].some((value) => value?.toLowerCase().includes(query)),
  );
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl bg-brand-soft/40 px-3 py-1.5">
          <h1 className="text-base font-medium text-brand-light">Кампании</h1>
          <p className="text-xs text-ink-muted">
            Список кампаний и их настроек
          </p>
        </div>
        <Link
          href={routes.organizationNew}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
        >
          <Plus className="size-4" />
          Добавить кампанию
        </Link>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink-muted">
        <Search className="size-5" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Поиск по названию, ID, псевдониму, агенту, хосту..."
          className="w-full bg-transparent text-ink outline-none placeholder:text-ink-muted"
        />
      </label>

      {isError ? (
        <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink">
            Не удалось загрузить список кампаний
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead className="border-b border-line-muted bg-surface-muted">
                <tr>
                  <th className="w-10 py-3.5 pr-1.5 pl-4">
                    <span className="sr-only">Открыть</span>
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-1.5 py-3.5 text-[13px] font-semibold whitespace-nowrap text-ink"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-muted">
                {isPending ? (
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="animate-pulse">
                      {Array.from({ length: columns.length + 1 }).map(
                        (__, cellIndex) => (
                          <td className="px-4 py-4" key={cellIndex}>
                            <div className="h-4 w-20 rounded bg-line-muted" />
                          </td>
                        ),
                      )}
                    </tr>
                  ))
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-14 text-center text-sm text-ink-muted"
                    >
                      Кампании не найдены
                    </td>
                  </tr>
                ) : (
                  pageItems.map((organization) => {
                    const href = routes.organization(
                      organization.organization_id,
                    );
                    const isExpanded = expandedId === organization.organization_id;
                    return (
                      <Fragment key={organization.organization_id}>
                        <tr
                          onClick={() => router.push(href)}
                          className="cursor-pointer transition-colors hover:bg-surface-muted"
                        >
                          <td className="py-3 pr-1.5 pl-4">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setExpandedId(
                                  isExpanded ? null : organization.organization_id,
                                );
                              }}
                              aria-expanded={isExpanded}
                              aria-label={`${isExpanded ? "Свернуть" : "Развернуть"} кампанию ${organization.name}`}
                              className="flex justify-center text-[#595555] hover:text-brand-light"
                            >
                              {isExpanded ? (
                                <SquareMinus className="size-[18px]" />
                              ) : (
                                <SquarePlus className="size-[18px]" />
                              )}
                            </button>
                          </td>
                          <td className={`${cellClass} font-medium`}>
                            {organization.name}
                          </td>
                          <td className={`${cellClass} font-mono text-xs`}>
                            {organization.organization_id}
                          </td>
                          <td className={cellClass}>
                            <Tags values={organization.aliases} />
                          </td>
                          <td className={cellClass}>
                            <Tags values={organization.agent_names} />
                          </td>
                          <td className={cellClass}>
                            <Tags values={organization.hostnames} />
                          </td>
                          <td className={`${cellClass} pr-4`}>
                            <span className="flex items-center gap-2 whitespace-nowrap">
                              <span
                                className={`size-2 shrink-0 rounded-full ${
                                  organization.enabled
                                    ? "bg-green-500"
                                    : "bg-red-600"
                                }`}
                              />
                              {organization.enabled ? "Активна" : "Отключена"}
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-white">
                            <td colSpan={columns.length + 1} className="p-0">
                              <div className="grid divide-x divide-line-muted md:grid-cols-3">
                                <DetailBlock title="Основные данные">
                                  <DetailRow label="Кампания" value={organization.name} />
                                  <DetailRow label="ID" value={organization.organization_id} mono />
                                  <DetailRow
                                    label="Статус"
                                    value={organization.enabled ? "Активна" : "Отключена"}
                                  />
                                </DetailBlock>
                                <DetailBlock title="Связанные сущности">
                                  <DetailRow
                                    label="Агенты"
                                    value={organization.agent_names?.join(", ") || "—"}
                                    mono
                                  />
                                  <DetailRow
                                    label="Хосты"
                                    value={organization.hostnames?.join(", ") || "—"}
                                    mono
                                  />
                                </DetailBlock>
                                <DetailBlock title="Сводка">
                                  <DetailRow label="Псевдонимов" value={String(organization.aliases?.length ?? 0)} />
                                  <DetailRow label="Агентов" value={String(organization.agent_ids?.length ?? 0)} />
                                  <Link
                                    href={href}
                                    className="mt-2 inline-block text-sm text-brand-light hover:underline"
                                  >
                                    Открыть кампанию
                                  </Link>
                                </DetailBlock>
                              </div>
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
            limit={PAGE_SIZE}
            total={items.length}
            onPageChange={setPage}
            isLoading={isPending}
            itemsLabel="кампаний"
            className="bg-surface-muted px-4 py-3"
          />
        </div>
      )}
    </section>
  );
}
