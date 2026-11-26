"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, FileSearch } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageHeader, pageStackClass } from "@/shared/ui/page-header";
import { SearchInput } from "@/shared/ui/search-input";
import { PaginationControl } from "@/shared/ui/pagination";
import { cn } from "@/shared/lib/utils";
import { getErrorMessage } from "@/shared/lib/errors";
import { routes } from "@/shared/config";
import {
  getMitreTechniqueStatus,
  MitreStatusBadge,
  useMitreTechniques,
  type MitreTechnique,
} from "@/entities/mitre-technique";
import {
  SyncMitreButton,
  SyncMitreStatus,
  useSyncMitre,
} from "@/features/mitre-sync";

// Вёрстка по фреймам «MITRE ATTACK» (Figma 608:9871) и «Mirte detail» (617:11041):
// при открытой технике таблица сужается и скрывает колонку «Изменение»

const PAGE_SIZE = 15;
const VISIBLE_PLATFORMS = 3;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value || "—" : dateFormatter.format(date);
}

function formatPlatforms(platforms: string[]) {
  if (!platforms.length) return "—";
  const visible = platforms.slice(0, VISIBLE_PLATFORMS).join(", ");
  const rest = platforms.length - VISIBLE_PLATFORMS;
  return rest > 0 ? `${visible}, +${rest}` : visible;
}

function matchesSearch(technique: MitreTechnique, search: string) {
  if (!search) return true;
  return [
    technique.mitre_id,
    technique.name,
    technique.description,
    ...technique.tactics,
    ...technique.platforms,
  ]
    .join(" ")
    .toLocaleLowerCase("ru-RU")
    .includes(search);
}

const headClass = "px-1.5 py-3.5 text-[13px] font-semibold whitespace-nowrap text-ink";
const cellClass = "px-1.5 py-3 text-sm text-ink";

type Props = {
  /** mitre_id открытой техники: строка подсвечивается, таблица становится компактной */
  selectedId?: string | null;
  /** Карточка техники — открывается справа от таблицы */
  detail?: ReactNode;
};

export function MitreTechniques({ selectedId, detail }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const query = useMitreTechniques();
  const sync = useSyncMitre();
  const compact = Boolean(selectedId);

  const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");
  const filtered = (query.data ?? []).filter((technique) =>
    matchesSearch(technique, normalizedSearch),
  );
  const sorted = sortDirection
    ? [...filtered].sort(
        (a, b) =>
          a.mitre_id.localeCompare(b.mitre_id, "en", { numeric: true }) *
          (sortDirection === "asc" ? 1 : -1),
      )
    : filtered;
  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  const currentPage = Math.min(page, totalPages);
  const techniques = sorted.slice((currentPage - 1) * size, currentPage * size);
  const columnCount = compact ? 5 : 6;

  return (
    <section className={pageStackClass}>
      <PageHeader title="MITRE ATT&CK" description="Справочник техник и тактик MITRE ATT&CK" />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Поиск по ID, названию или описанию"
          label="Поиск техник MITRE"
        />
        {!compact && <SyncMitreButton sync={sync} />}
      </div>

      <SyncMitreStatus sync={sync} />

      <div className={cn("grid items-start gap-5", detail && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]")}>
      <div className={cn("min-w-0", detail && "order-2 xl:order-1")}>
      {query.isError ? (
        <div className="space-y-3 rounded-2xl border border-line bg-white py-16 text-center">
          <p className="font-semibold text-ink" role="alert">
            {getErrorMessage(query.error, "Не удалось загрузить техники MITRE ATT&CK.")}
          </p>
          <Button variant="outline" onClick={() => query.refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className={cn("w-full text-left", compact ? "min-w-[520px]" : "min-w-[900px]")}>
              <thead className="border-b border-line-muted bg-surface-muted">
                <tr>
                  <th
                    className={cn(headClass, "w-[84px] pl-4")}
                    aria-sort={
                      sortDirection === "asc"
                        ? "ascending"
                        : sortDirection === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    <button
                      type="button"
                      onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
                      className="flex items-center gap-1.5"
                    >
                      ID
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform",
                          sortDirection ? "text-brand-light" : "text-ink-muted",
                          sortDirection === "asc" && "rotate-180",
                        )}
                      />
                    </button>
                  </th>
                  <th className={cn(headClass, "text-center")}>Название техники</th>
                  <th className={cn(headClass, "text-center")}>Тактика</th>
                  <th className={cn(headClass, "text-center")}>Платформы</th>
                  <th className={cn(headClass, "w-[110px] text-center", compact && "pr-4")}>Статус</th>
                  {!compact && <th className={cn(headClass, "w-[120px] pr-4 text-center")}>Изменение</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-muted">
                {query.isPending ? (
                  Array.from({ length: 8 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="animate-pulse">
                      {Array.from({ length: columnCount }).map((__, cellIndex) => (
                        <td className="px-4 py-4" key={cellIndex}>
                          <div className="h-4 w-16 rounded bg-line-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : techniques.length === 0 ? (
                  <tr>
                    <td colSpan={columnCount} className="px-4 py-14 text-center text-sm text-ink-muted">
                      <FileSearch className="mx-auto mb-2 h-8 w-8 text-line" />
                      {normalizedSearch ? "По запросу ничего не найдено" : "Техники MITRE не найдены"}
                    </td>
                  </tr>
                ) : (
                  techniques.map((technique) => {
                    const isSelected = technique.mitre_id === selectedId;
                    return (
                      <tr
                        key={technique.mitre_id}
                        aria-selected={isSelected || undefined}
                        className={cn(
                          "align-top transition-colors",
                          isSelected ? "bg-brand-soft/40" : "hover:bg-surface-muted",
                        )}
                      >
                        <td className={cn(cellClass, "pl-4 whitespace-nowrap")}>
                          <Link
                            href={routes.mitreTechnique(technique.mitre_id)}
                            scroll={false}
                            aria-current={isSelected ? "page" : undefined}
                            className="font-semibold text-[#1067c2] hover:underline"
                          >
                            {technique.mitre_id}
                          </Link>
                        </td>
                        <td className={cn(cellClass, "text-center")}>
                          {technique.name}
                          {technique.is_subtechnique && (
                            <span className="block text-xs text-ink-muted">Подтехника</span>
                          )}
                        </td>
                        <td className={cn(cellClass, "text-center")}>
                          {technique.tactics.length ? technique.tactics.join(", ") : "—"}
                        </td>
                        <td className={cn(cellClass, "text-center")}>
                          {formatPlatforms(technique.platforms)}
                        </td>
                        <td className={cn(cellClass, "text-center", compact && "pr-4")}>
                          <MitreStatusBadge status={getMitreTechniqueStatus(technique)} />
                        </td>
                        {!compact && (
                          <td className={cn(cellClass, "pr-4 text-center whitespace-nowrap")}>
                            {formatDate(technique.modified)}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControl
            page={currentPage}
            limit={size}
            total={sorted.length}
            onPageChange={setPage}
            onLimitChange={
              compact
                ? undefined
                : (nextSize) => {
                    setSize(nextSize);
                    setPage(1);
                  }
            }
            pageSizeOptions={[15, 30, 50, 100]}
            isLoading={query.isPending}
            itemsLabel="техник"
            className="bg-surface-muted px-4 py-3"
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
