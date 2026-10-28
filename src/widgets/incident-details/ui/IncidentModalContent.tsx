"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import {
  INCIDENT_STATUS_LABELS,
  type Incident,
  type IncidentSchema,
} from "@/entities/incident";
import { IncidentStatusMenu } from "@/features/incident-change-status";

// Вёрстка по фрейму «modal» макета CERT-KG SIEM (Figma 164:4587)

type Value = string | number | boolean | null | undefined;

function formatDateTime(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function isEmpty(value: Value | Value[]) {
  if (Array.isArray(value)) return value.length === 0;
  return value === null || value === undefined || value === "";
}

function toText(value: Value | Value[]) {
  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function Pill({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

// Строка «ключ — значение» с колонкой ключа 220px, как в макете
function Row({
  label,
  value,
  mono,
  empty = "—",
  valueClassName,
}: {
  label: string;
  value: Value | Value[];
  mono?: boolean;
  empty?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-xs font-medium text-gray-500 sm:w-[220px]">
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 flex-1 text-[13px] wrap-break-word whitespace-pre-wrap text-gray-900",
          mono && "font-mono",
          valueClassName,
        )}
      >
        {isEmpty(value) ? empty : toText(value)}
      </dd>
    </div>
  );
}

function Card({
  title,
  badge,
  muted,
  children,
}: {
  title: string;
  badge?: ReactNode;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-[10px] border border-gray-200 p-4",
        muted ? "bg-surface-muted" : "bg-white",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}

function Rows({ children }: { children: ReactNode }) {
  return <dl className="flex flex-col gap-2.5">{children}</dl>;
}

function SummaryLine({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      {children}
    </div>
  );
}

function Score({ value }: { value: number | null | undefined }) {
  return (
    <span className="font-mono text-sm font-semibold whitespace-pre text-gray-900">
      {value ?? "—"}  /  100
    </span>
  );
}

function VerdictPill({ decision }: { decision: string }) {
  const malicious = decision.trim().toLowerCase() === "malicious";
  return (
    <Pill
      className={
        malicious ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
      }
    >
      {decision.trim() || "—"}
    </Pill>
  );
}

// Сворачиваемый блок внизу модалки: в свёрнутом виде — одна строка-превью
function CollapsibleCard({
  title,
  preview,
  children,
}: {
  title: string;
  preview: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-3 rounded-[10px] border border-gray-200 bg-surface-muted p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex shrink-0 items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
        >
          {open ? "Свернуть" : "Развернуть"}
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      {open ? (
        children
      ) : (
        <p className="truncate text-[13px] text-gray-500">{preview || "—"}</p>
      )}
    </section>
  );
}

function hostActivity(incident: Incident) {
  return [
    ["event_codes", incident.event_codes],
    ["file_paths", incident.file_paths],
    ["winlog_channels", incident.winlog_channels],
    ["computer_names", incident.computer_names],
    ["process_names", incident.process_names],
    ["process_paths", incident.process_paths],
    ["process_command_lines", incident.process_command_lines],
    ["parent_process_names", incident.parent_process_names],
    ["parent_process_command_lines", incident.parent_process_command_lines],
    ["registry_keys", incident.registry_keys],
    ["service_names", incident.service_names],
    ["task_names", incident.task_names],
  ] as const;
}

const RAW_FIELDS = [
  "@timestamp",
  "_elastic_index",
  "_elastic_id",
  "elastic_event_refs",
  "links",
  "extra",
] as const;

export function IncidentModalContent({ data }: { data: IncidentSchema }) {
  const { incident } = data;
  const targetHost =
    incident.destination_host ??
    incident.destination_hosts[0] ??
    incident.asset_hostname;
  const siemScore = incident.score_breakdown?.final ?? incident.risk_score;
  const isOpen =
    incident.analyst_status !== "closed" &&
    incident.analyst_status !== "false_positive";
  const techniques = data.mitre?.techniques?.length
    ? data.mitre.techniques
    : incident.mitre_ids;
  const kibanaUrl = data.links?.raw_events;
  const activity = hostActivity(incident).filter(
    ([, values]) => values.length > 0,
  );
  const payloadText = incident.payloads.join("\n");

  const copyId = () => {
    navigator.clipboard.writeText(incident.incident_id).then(
      () => toast.success("ID инцидента скопирован"),
      () => toast.error("Не удалось скопировать ID"),
    );
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-[26px]">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="text-2xl font-semibold break-all text-gray-900 sm:text-[32px]">
              Инцидент {incident.incident_id}
            </h1>
            <button
              type="button"
              onClick={copyId}
              aria-label="Скопировать ID инцидента"
              className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#d9ebfc] bg-[#f2f9ff] text-[#0965c5] hover:bg-[#e6f4ff]"
            >
              <Copy className="size-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {kibanaUrl ? (
              <a
                href={kibanaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-brand-light px-3.5 text-sm font-medium text-white hover:bg-brand"
              >
                Открыть в Kibana
                <ExternalLink className="size-4" />
              </a>
            ) : (
              <span
                aria-disabled
                title="Ссылка на события недоступна"
                className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-brand-light px-3.5 text-sm font-medium text-white opacity-50"
              >
                Открыть в Kibana
                <ExternalLink className="size-4" />
              </span>
            )}
            <IncidentStatusMenu incident={incident} />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-500 sm:text-xl">
          {incident.attack_type || "Тип атаки не определен"}
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2.5 rounded-[10px] border border-gray-200 bg-surface-muted p-3.5">
            <SummaryLine label="Статус">
              <Pill className="bg-[#e6f4ff] text-[#0965c5]">
                {INCIDENT_STATUS_LABELS[incident.analyst_status] ??
                  incident.analyst_status}
              </Pill>
            </SummaryLine>
            <SummaryLine label="Оценка в сводке">
              <Score value={incident.risk_score} />
            </SummaryLine>
            <SummaryLine label="Целевой хост">
              <span className="text-sm font-semibold text-gray-900">
                {targetHost || "—"}
              </span>
            </SummaryLine>
          </div>
          <div className="flex flex-col gap-2.5 rounded-[10px] border border-gray-200 bg-surface-muted p-3.5">
            <SummaryLine label="Оценка SIEM">
              <Score value={siemScore} />
            </SummaryLine>
            <SummaryLine label="Вердикт">
              <VerdictPill decision={incident.decision} />
            </SummaryLine>
            <SummaryLine label="Количество событий">
              <span className="text-sm font-semibold text-gray-900">
                {incident.event_count}
              </span>
            </SummaryLine>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <Card
            title="Основная информация"
            badge={
              <Pill
                className={
                  isOpen
                    ? "bg-[#f2f9ff] text-[#0965c5]"
                    : "bg-gray-100 text-gray-700"
                }
              >
                {isOpen ? "Открыто" : "Закрыто"}
              </Pill>
            }
          >
            <Rows>
              <Row label="incident_id" value={incident.incident_id} mono />
              <Row
                label="start_time"
                value={formatDateTime(incident.start_time)}
              />
              <Row label="organization_id" value={incident.organization_id} />
              <Row label="end_time" value={formatDateTime(incident.end_time)} />
              <Row label="attack_type" value={incident.attack_type} />
              <Row
                label="duration_seconds"
                value={incident.duration_seconds}
              />
            </Rows>
          </Card>

          <Card title="Анализ SIEM" muted>
            <div className="flex flex-col gap-2">
              {incident.ai_analysis && (
                <p className="text-base font-semibold text-gray-900">
                  {incident.ai_analysis}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Pill className="bg-gray-100 text-gray-700">Оценка SIEM</Pill>
                <span className="font-mono text-sm font-bold whitespace-pre text-gray-900">
                  {siemScore}  /  100
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Pill className="bg-red-100 text-red-700">Вердикт</Pill>
                <span className="text-sm font-bold text-red-700">
                  {incident.decision.trim() || "—"}
                </span>
              </div>
            </div>
            <Rows>
              <Row label="Целевой хост" value={targetHost} />
              <Row label="Количество событий" value={incident.event_count} />
              <Row
                label="Время начала"
                value={formatDateTime(incident.start_time)}
              />
              <Row
                label="Время окончания"
                value={formatDateTime(incident.end_time)}
              />
            </Rows>
            {!!incident.explanation?.length && (
              <div className="flex flex-col gap-2 text-sm">
                <h3 className="font-semibold text-gray-900">
                  Активность и MITRE ATT&CK
                </h3>
                {incident.explanation.map((line, index) => (
                  <p key={index} className="text-gray-700">
                    {line}
                  </p>
                ))}
              </div>
            )}
            {techniques.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold text-gray-900">
                  MITRE ATT&CK техники:
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {techniques.map((technique) => (
                    <li
                      key={technique}
                      className="flex items-start gap-2 text-sm text-[#0965c5]"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#0965c5]" />
                      {technique}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {incident.recommendations.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Рекомендации
                </h3>
                <ol className="flex flex-col gap-2">
                  {incident.recommendations.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-[10px] bg-[#e6f4ff] text-xs font-bold text-[#0965c5]">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-sm font-semibold text-gray-900">
                Метаданные
              </h3>
              <Rows>
                <Row
                  label="ID атаки"
                  value={incident.attack_id}
                  mono
                  valueClassName="text-gray-700"
                />
                <Row
                  label="ID кампании"
                  value={incident.campaign_id}
                  mono
                  valueClassName="text-gray-700"
                />
              </Rows>
            </div>
          </Card>

          <Card title="Source / Destination">
            <Rows>
              <Row label="source_ip" value={incident.source_ip} mono />
              <Row
                label="destination_ip"
                value={incident.destination_ip}
                mono
              />
              <Row label="source_ips" value={incident.source_ips} mono />
              <Row
                label="destination_ips"
                value={incident.destination_ips}
                mono
              />
              <Row label="source_users" value={incident.source_users} />
              <Row
                label="destination_host"
                value={incident.destination_host}
              />
              <Row label="source_hosts" value={incident.source_hosts} mono />
              <Row
                label="destination_hosts"
                value={incident.destination_hosts}
                mono
              />
              <Row label="target_ports" value={incident.target_ports} mono />
              <Row label="target_users" value={incident.target_users} />
            </Rows>
          </Card>

          <Card title="MITRE ATT&CK">
            <Rows>
              <Row label="kill_chain" value={incident.kill_chain} />
              <Row
                label="mitre.ids"
                value={data.mitre?.ids ?? incident.mitre_ids}
                mono
              />
              <Row
                label="mitre.tactics"
                value={data.mitre?.tactics ?? incident.tactics}
              />
              <Row label="mitre.techniques" value={data.mitre?.techniques} />
            </Rows>
          </Card>

          <Card title="Payload">
            <Rows>
              <Row label="payload" value={payloadText} mono />
              <Row label="payload_type" value={incident.payload_type} />
              <Row
                label="payload_indicators"
                value={incident.payload_indicators}
                mono
              />
              <Row label="urls" value={incident.urls} mono />
            </Rows>
          </Card>

          <Card title="Детектирование">
            <Rows>
              <Row label="event_actions" value={incident.event_actions} />
              <Row
                label="detection_rules_descriptions"
                value={incident.detection_rule_descriptions}
              />
              <Row label="signatures" value={incident.signatures} />
              <Row label="signature_ids" value={incident.signature_ids} />
              <Row
                label="detection_confidences"
                value={incident.detection_confidences}
              />
              <Row label="attack_names" value={incident.attack_names} />
              <Row label="severity_hints" value={incident.severity_hints} />
              <Row
                label="detection_rule_ids"
                value={incident.detection_rule_ids}
              />
              <Row label="scenario_type" value={incident.scenario_type} />
            </Rows>
          </Card>

          <Card title="События и связи">
            <Rows>
              <Row label="event_count" value={incident.event_count} />
              <Row label="raw_event_count" value={data.raw_event_count} />
              <Row label="ioc_match_count" value={data.ioc_match_count} />
              <Row
                label="scenario_ids"
                value={data.scenario_ids ?? incident.scenario_ids}
              />
              <Row label="micro_incidents" value={incident.micro_incidents} />
              <Row label="unique_sources" value={incident.unique_sources} />
              <Row label="has_success" value={incident.has_success} />
              <Row label="campaign_id" value={incident.campaign_id} />
              <Row label="attack_id" value={incident.attack_id} />
              <Row label="session_key" value={incident.session_key} />
            </Rows>
          </Card>

          <Card title="IOC">
            {data.ioc_matches?.length ? (
              <ul className="flex flex-col gap-1 font-mono text-[13px] text-gray-700">
                {data.ioc_matches.map((match) => (
                  <li key={match} className="wrap-break-word">
                    {match}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700">Совпадений не обнаружено</p>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Источник наблюдения">
            <Rows>
              <Row label="observer_host" value={incident.observer_host} />
              <Row
                label="log_source_types"
                value={incident.log_source_types}
              />
              <Row label="product_names" value={incident.product_names} />
            </Rows>
          </Card>

          <Card title="Расчёт риска">
            <Rows>
              <Row
                label="mitre"
                value={incident.score_breakdown?.mitre}
                empty="Нет данных"
              />
              <Row
                label="technique"
                value={incident.score_breakdown?.technique}
                empty="Нет данных"
              />
              <Row
                label="base"
                value={incident.score_breakdown?.base}
                empty="Нет данных"
              />
              <Row
                label="volume"
                value={incident.score_breakdown?.volume}
                empty="Нет данных"
              />
              <Row
                label="final"
                value={siemScore}
                mono
                valueClassName="text-sm font-bold text-[#0965c5]"
              />
            </Rows>
          </Card>

          <Card title="Suppression">
            <Rows>
              <Row
                label="suppressed"
                value={incident.suppressed}
                empty="Нет данных"
              />
              <Row
                label="suppression_rule"
                value={incident.suppression_rule}
                empty="Нет данных"
              />
              <Row
                label="suppression_mode"
                value={incident.suppression_mode}
                empty="Нет данных"
              />
              <Row
                label="suppression_reason"
                value={incident.suppression_reason}
                empty="Нет данных"
              />
            </Rows>
          </Card>

          <Card title="Технические данные">
            <Rows>
              <Row label="@timestamp" value={incident["@timestamp"]} mono />
              <Row
                label="_elastic_index"
                value={incident._elastic_index}
                mono
              />
              <Row label="_elastic_id" value={incident._elastic_id} mono />
              <Row
                label="elastic_event_refs"
                value={incident.elastic_event_refs.map(
                  (ref) => `${ref.index}/${ref.id}`,
                )}
                mono
              />
              <Row label="links" value={data.links?.raw_events} mono />
              <Row label="extra_data" value={incident.extra} mono />
            </Rows>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <CollapsibleCard title="Payload" preview={incident.payloads.join(" ")}>
          <pre className="overflow-x-auto font-mono text-[13px] wrap-break-word whitespace-pre-wrap text-gray-700">
            {payloadText || "—"}
          </pre>
        </CollapsibleCard>

        <CollapsibleCard
          title="Активность на хосте"
          preview={activity
            .map(([key, values]) => `${key}: ${values.join(" ")}`)
            .join(", ")}
        >
          <Rows>
            {activity.length ? (
              activity.map(([key, values]) => (
                <Row key={key} label={key} value={[...values]} mono />
              ))
            ) : (
              <p className="text-[13px] text-gray-500">Нет данных</p>
            )}
          </Rows>
        </CollapsibleCard>

        <CollapsibleCard
          title="Сырые технические поля"
          preview={RAW_FIELDS.join(", ")}
        >
          <pre className="max-h-96 overflow-auto rounded-md bg-white p-3 font-mono text-xs text-gray-700">
            {JSON.stringify(incident, null, 2)}
          </pre>
        </CollapsibleCard>
      </div>
    </div>
  );
}
