"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, SquareMinus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import { INCIDENT_SEVERITY_COLORS } from "@/entities/incident";
import {
  SCENARIO_SEVERITY_LABELS,
  SCENARIO_STATUS_LABELS,
  useScenario,
  type SecurityScenario,
} from "@/entities/scenario";
import {
  formatDateTime,
  getAnalystStatusLabel,
  sortItems,
  type SortState,
} from "../lib/table";

// Раскрытая строка сценария: фрейм «подробная часть» (Figma 468:1741) и «Связанные инциденты» (471:3732)

const cardClass = "border border-[#e5e7eb] bg-surface px-[15px] py-4";
const cardTitleClass = "text-sm font-semibold text-brand-light";

// Подложка и цвет значения критичности актива; critical — как в макете
const ASSET_CRITICALITY_STYLES: Record<string, string> = {
  critical: "bg-[rgba(243,105,105,0.55)] text-[#b50000]",
  high: "bg-[#ff8024]/25 text-[#c25400]",
  medium: "bg-[#0965c5]/15 text-[#0965c5]",
  low: "bg-[#0ac053]/20 text-[#078a3b]",
};

function InfoRow({
  label,
  children,
  labelWidth = "w-[118px]",
}: {
  label: string;
  children: ReactNode;
  labelWidth?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt className={cn("shrink-0 text-xs font-medium text-[#6b7280]", labelWidth)}>{label}</dt>
      <dd className="min-w-0 flex-1 text-[13px] break-words text-[#111827]">{children}</dd>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const value = Math.min(100, Math.max(0, score));

  return (
    <div className="relative size-[78px] shrink-0">
      <svg viewBox="0 0 78 78" className="size-full -rotate-90" aria-hidden>
        <circle cx="39" cy="39" r={radius} fill="none" strokeWidth="6" className="stroke-brand-soft" />
        <circle
          cx="39"
          cy="39"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          className="stroke-brand-light"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-black">
        <span className="text-[15px] leading-tight font-semibold">{Math.round(score)} /</span>
        <span className="text-xs leading-tight">100</span>
      </div>
    </div>
  );
}

function ScenarioInfoCards({
  scenario,
  onCollapse,
}: {
  scenario: SecurityScenario;
  onCollapse: () => void;
}) {
  const severity = scenario.severity;
  const assetCriticality = scenario.asset_criticality?.toLowerCase();

  return (
    <div className="grid gap-0.5 md:grid-cols-2 xl:grid-cols-[minmax(0,353fr)_minmax(0,237fr)_minmax(0,375fr)_minmax(0,262fr)]">
      <section className={cn(cardClass, "pl-3")}>
        <div className="mb-3 flex items-center gap-[15px] px-5">
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Свернуть сценарий"
            className="text-[#595555] hover:text-brand-light"
          >
            <SquareMinus className="size-[18px]" />
          </button>
          <h3 className={cardTitleClass}>Основная информация</h3>
        </div>
        <dl className="flex flex-col gap-2.5">
          <InfoRow label="Тип сценария">{scenario.scenario_type || "—"}</InfoRow>
          <InfoRow label="Системный статус">
            {scenario.status ? (SCENARIO_STATUS_LABELS[scenario.status] ?? scenario.status) : "—"}
          </InfoRow>
          <InfoRow label="Статус">{getAnalystStatusLabel(scenario.analyst_status)}</InfoRow>
          <InfoRow label="Организация">{scenario.organization_id || "—"}</InfoRow>
        </dl>
      </section>

      <section className={cardClass}>
        <h3 className={cn(cardTitleClass, "mb-3")}>Связанные хосты и актив</h3>
        <dl className="flex flex-col gap-2.5">
          <InfoRow label="Observer host" labelWidth="w-[108px]">
            {scenario.observer_host || "—"}
          </InfoRow>
          <InfoRow label="Destination host" labelWidth="w-[108px]">
            {scenario.destination_host || "—"}
          </InfoRow>
          <InfoRow label="Asset hostname" labelWidth="w-[108px]">
            {scenario.asset_hostname || "—"}
          </InfoRow>
          <InfoRow label="Критичность" labelWidth="w-[108px]">
            {assetCriticality ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-[5px] px-1.5 capitalize",
                  ASSET_CRITICALITY_STYLES[assetCriticality] ?? "bg-line-muted text-ink",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full bg-current",
                    INCIDENT_SEVERITY_COLORS[assetCriticality]?.dot,
                  )}
                />
                {assetCriticality}
              </span>
            ) : (
              "—"
            )}
          </InfoRow>
        </dl>
      </section>

      <section className={cn(cardClass, "px-3.5")}>
        <h3 className={cn(cardTitleClass, "mb-4")}>Оценка сценария</h3>
        <div className="flex gap-4 border-b border-brand-light/40 pb-4">
          <ScoreRing score={scenario.scenario_score ?? 0} />
          <div>
            <p className="text-xs font-semibold text-brand">Итоговая оценка сценария</p>
            <p className="mt-1 text-xs text-black">
              Формируется на основе критичности, количества связанных инцидентов, ценности
              актива, плотности событий и совпадения/признаков атаки
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold text-brand">Учитываемые факторы:</p>
        <ul className="mt-3 flex flex-col gap-[5px] pl-1.5 text-xs text-black">
          {[
            <>
              <span className="font-medium">Критичность: </span>
              <span className={cn("font-medium", severity && INCIDENT_SEVERITY_COLORS[severity]?.text)}>
                {severity ? SCENARIO_SEVERITY_LABELS[severity] : "—"}
              </span>
            </>,
            <>Связанные инциденты: {scenario.incident_count ?? 0}</>,
            <>
              Критичность актива:{" "}
              <span
                className={cn(
                  "font-medium",
                  assetCriticality && INCIDENT_SEVERITY_COLORS[assetCriticality]?.text,
                )}
              >
                {scenario.asset_criticality || "—"}
              </span>
            </>,
            <>Плотность событий: {scenario.raw_event_count ?? 0} raw events</>,
            <>IOC совпадений: {scenario.ioc_match_count ?? 0}</>,
          ].map((factor, index) => (
            <li key={index} className="flex items-center gap-3">
              <span className="size-[7px] shrink-0 rounded-full bg-brand-light" />
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={cardClass}>
        <h3 className={cn(cardTitleClass, "mb-3")}>Время</h3>
        <dl className="flex flex-col gap-2.5 text-xs font-medium">
          <div className="flex flex-col gap-[5px]">
            <dt className="text-brand">Первое событие</dt>
            <dd className="text-[#6b7280]">{formatDateTime(scenario.first_seen, false)}</dd>
          </div>
          <div className="flex flex-col gap-[5px]">
            <dt className="text-brand">Последнее событие</dt>
            <dd className="text-[#6b7280]">{formatDateTime(scenario.last_seen, false)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

type IncidentSortKey =
  | "incident_id"
  | "organization_id"
  | "severity"
  | "source_ip"
  | "destination_ip"
  | "end_time"
  | "start_time"
  | "attack_type";

const SEVERITY_RANK: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

const incidentColumns: Array<{ key: IncidentSortKey; label: string; width: string }> = [
  { key: "incident_id", label: "ID инцидента", width: "w-[164px]" },
  { key: "organization_id", label: "Организация", width: "w-[128px]" },
  { key: "severity", label: "Критичность", width: "w-[128px]" },
  { key: "source_ip", label: "Source IP", width: "w-[144px]" },
  { key: "destination_ip", label: "Destination IP", width: "w-[144px]" },
  { key: "end_time", label: "Время", width: "w-[184px]" },
  { key: "start_time", label: "Начало инцидента", width: "w-[160px]" },
  { key: "attack_type", label: "Атака", width: "w-[130px]" },
];

type RelatedIncident = NonNullable<
  ReturnType<typeof useScenario>["data"]
>["related_incidents"][number];

function getIncidentSortValue(incident: RelatedIncident, key: IncidentSortKey) {
  switch (key) {
    case "severity":
      return SEVERITY_RANK[incident.severity] ?? 0;
    case "end_time":
    case "start_time":
      return incident[key] ? new Date(incident[key]).getTime() : 0;
    default:
      return incident[key] ?? "";
  }
}

// Как в таблице инцидентов: сначала все инциденты этого source_ip, без него — сразу карточка
const getIncidentHref = (incident: RelatedIncident) =>
  incident.source_ip
    ? routes.sourceIpIncidents(incident.source_ip)
    : routes.incident(incident.incident_id);

function RelatedIncidents({ scenarioId }: { scenarioId: string }) {
  const [sort, setSort] = useState<SortState<IncidentSortKey>>(null);
  const { data, isPending, error, refetch } = useScenario(scenarioId);
  const incidents = sortItems(data?.related_incidents ?? [], sort, getIncidentSortValue);

  const toggleSort = (key: IncidentSortKey) => {
    setSort((current) =>
      current?.key === key && current.direction === "desc"
        ? { key, direction: "asc" }
        : { key, direction: "desc" },
    );
  };

  return (
    <section className="border border-[#ccdae7] bg-surface">
      <header className="flex h-[60px] items-center gap-2 border-b border-line-muted pr-4 pl-[35px]">
        <Image
          src="/icons/incident-network-diagram.png"
          alt=""
          width={32}
          height={32}
          className="size-8 object-cover"
        />
        <h3 className="text-sm font-semibold text-brand-light">Связанные инциденты</h3>
        {data && (
          <span className="text-xs text-ink-muted">({data.related_incident_count})</span>
        )}
      </header>

      {error ? (
        <div className="space-y-3 py-8 text-center">
          <p className="text-sm text-ink">Не удалось загрузить связанные инциденты</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="max-h-[360px] overflow-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-line-muted">
                {incidentColumns.map((column, index) => {
                  const isSorted = sort?.key === column.key;
                  return (
                    <th
                      key={column.key}
                      className={cn(
                        "py-3 pr-0.5",
                        index === 0 && "pl-4",
                        column.key === "attack_type" && "pr-4",
                        column.width,
                      )}
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
                        className={cn(
                          "flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap text-ink",
                          column.key === "attack_type" && "mx-auto",
                        )}
                      >
                        {column.label}
                        <ChevronDown
                          className={cn(
                            "size-3.5 transition-transform",
                            isSorted ? "text-brand-light" : "text-ink-muted",
                            isSorted && sort.direction === "asc" && "rotate-180",
                          )}
                        />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-muted text-sm text-ink">
              {isPending ? (
                Array.from({ length: 3 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="animate-pulse">
                    {incidentColumns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <div className="h-4 w-16 rounded bg-line-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : incidents.length === 0 ? (
                <tr>
                  <td
                    colSpan={incidentColumns.length}
                    className="px-4 py-8 text-center text-ink-muted"
                  >
                    Связанных инцидентов нет
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => {
                  const severity = INCIDENT_SEVERITY_COLORS[incident.severity];
                  return (
                    <tr
                      key={incident.incident_id}
                      className="transition-colors hover:bg-white"
                    >
                      <td className="py-3 pr-0.5 pl-4 break-all">
                        <Link
                          href={getIncidentHref(incident)}
                          className="text-brand hover:underline"
                        >
                          {incident.incident_id}
                        </Link>
                      </td>
                      <td className="py-3 pr-0.5 break-all">{incident.organization_id || "—"}</td>
                      <td className="py-3 pr-0.5">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn("size-2 shrink-0 rounded-full bg-ink-muted", severity?.dot)}
                          />
                          {incident.severity}
                        </span>
                      </td>
                      <td className="py-3 pr-0.5 whitespace-nowrap">
                        {incident.source_ip ?? incident.source_user ?? "—"}
                      </td>
                      <td className="py-3 pr-0.5 whitespace-nowrap">
                        {incident.destination_ip ?? incident.destination_host ?? "—"}
                      </td>
                      <td className="py-3 pr-0.5 whitespace-nowrap">
                        {formatDateTime(incident.end_time)}
                      </td>
                      <td className="py-3 pr-0.5 whitespace-nowrap">
                        {formatDateTime(incident.start_time)}
                      </td>
                      <td className="py-3 pr-4 text-center">{incident.attack_type || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function ScenarioExpandedRow({
  scenario,
  scenarioId,
  onCollapse,
}: {
  scenario: SecurityScenario;
  scenarioId: string;
  onCollapse: () => void;
}) {
  return (
    // w-0 + min-w-full: содержимое заполняет ячейку, но не влияет на ширину колонок общей таблицы,
    // иначе при раскрытии строки таблица расширяется и колонки сдвигаются
    <div className="w-0 min-w-full bg-surface">
      <ScenarioInfoCards scenario={scenario} onCollapse={onCollapse} />
      <RelatedIncidents scenarioId={scenarioId} />
    </div>
  );
}
