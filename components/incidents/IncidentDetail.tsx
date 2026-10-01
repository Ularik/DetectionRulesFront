"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PaginationControl } from "@/components/pagination/pagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useIncidentDetai,
  useIncidentEvents,
  usePatchIncidentStatus,
} from "@/services/incident/incidentQueries";
import type { ANALYST_STATUS, Incident } from "@/types/incidents";
import type { WazuhEvent } from "@/types/incidentEvents";

interface IncidentDetailProps {
  incidentId: string;
}

const severityStyles: Record<string, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-sky-200 bg-sky-50 text-sky-700",
};

const statusLabels: Record<ANALYST_STATUS, string> = {
  new: "Новый",
  in_review: "На проверке",
  confirmed: "Подтвержден",
  false_positive: "Ложное срабатывание",
  closed: "Закрыт",
};

const analystStatuses = Object.keys(statusLabels) as ANALYST_STATUS[];

function isAnalystStatus(value: string): value is ANALYST_STATUS {
  return value in statusLabels;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds} сек.`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин.`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes ? `${hours} ч. ${minutes} мин.` : `${hours} ч.`;
}

function display(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 wrap-break-word text-sm font-medium text-gray-900">
        {display(value)}
      </dd>
    </div>
  );
}

function FieldList({
  label,
  values,
}: {
  label: string;
  values: Array<string | number> | null | undefined;
}) {
  const items = values?.filter((value) => value !== "" && value !== null) ?? [];

  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 wrap-break-word text-sm font-medium text-gray-900">
        {items.length ? items.join(", ") : "—"}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function IncidentContent({ incident }: { incident: Incident }) {
  const [showEvents, setShowEvents] = useState(false);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsSize, setEventsSize] = useState(10);
  const updateStatus = usePatchIncidentStatus();
  const eventsQuery = useIncidentEvents({
    incidentId: incident.incident_id,
    page: eventsPage,
    size: eventsSize,
    enabled: showEvents,
  });
  const severityClass =
    severityStyles[incident.severity.toLowerCase()] ??
    "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="min-w-0">
          <p className="mb-2 text-sm text-gray-500">Детали инцидента</p>
          <h1 className="break-all font-mono text-xl font-bold text-gray-950">
            {incident.incident_id}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {incident.attack_type || "Тип атаки не определен"}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span
            className={`rounded-md border px-2.5 py-1 text-xs font-semibold uppercase ${severityClass}`}
          >
            {incident.severity || "Не указана"}
          </span>
          <div className="grid gap-1">
            <label
              htmlFor="incident-analyst-status"
              className="text-xs font-medium text-gray-500"
            >
              Статус аналитика
            </label>
            <Select
              value={incident.analyst_status}
              disabled={updateStatus.isPending}
              onValueChange={(value) => {
                if (
                  !isAnalystStatus(value) ||
                  value === incident.analyst_status
                ) {
                  return;
                }

                updateStatus.mutate(
                  {
                    incidentId: incident.incident_id,
                    analystStatus: value,
                  },
                  {
                    onSuccess: () =>
                      toast.success("Статус инцидента обновлен", {
                        position: "top-center",
                      }),
                    onError: () =>
                      toast.error("Не удалось обновить статус", {
                        position: "top-center",
                      }),
                  },
                );
              }}
            >
              <SelectTrigger
                id="incident-analyst-status"
                className="w-48 bg-white"
                aria-label="Изменить статус аналитика"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {analystStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Risk score", value: incident.risk_score },
          { label: "Событий", value: incident.event_count },
          { label: "Приоритет", value: incident.priority },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <p className="text-xs font-medium text-gray-500">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {display(metric.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <Button
          variant="outline"
          aria-expanded={showEvents}
          onClick={() => setShowEvents((current) => !current)}
        >
          {showEvents ? <EyeOff /> : <Eye />}
          {showEvents ? "Скрыть события" : "Просмотреть события"}
          <span className="text-gray-500">({incident.event_count})</span>
        </Button>
      </div>

      {showEvents && (
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-gray-900">
              События инцидента
            </h2>
            <p className="text-xs text-gray-500">
              {eventsQuery.data?.total ?? incident.event_count} записей
            </p>
          </div>

          {eventsQuery.isPending ? (
            <div className="space-y-3" aria-label="Загрузка событий">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-md bg-gray-100"
                />
              ))}
            </div>
          ) : eventsQuery.isError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-600">
                Не удалось загрузить события инцидента.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => eventsQuery.refetch()}
              >
                Повторить попытку
              </Button>
            </div>
          ) : (eventsQuery.data?.items.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Для этого инцидента события не найдены.
            </p>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {eventsQuery.data?.items.map((event, index) => (
                  <IncidentEventItem
                    key={event._elastic_id ?? event.id ?? index}
                    event={event}
                  />
                ))}
              </div>
              <PaginationControl
                page={eventsPage}
                limit={eventsSize}
                total={eventsQuery.data?.total ?? 0}
                onPageChange={setEventsPage}
                onLimitChange={(size) => {
                  setEventsSize(size);
                  setEventsPage(1);
                }}
                isLoading={eventsQuery.isFetching}
              />
            </>
          )}
        </section>
      )}

      <div className="space-y-5">
        <Section title="Сводка">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Организация" value={incident.organization_id} />
            <Field label="Решение" value={incident.decision} />
            <Field label="Действие" value={incident.action} />
            <Field label="Начало" value={formatDate(incident.start_time)} />
            <Field label="Завершение" value={formatDate(incident.end_time)} />
            <Field
              label="Длительность"
              value={formatDuration(incident.duration_seconds)}
            />
            <Field label="Кампания" value={incident.campaign_id} />
            <Field label="Тип сценария" value={incident.scenario_type} />
            <Field
              label="Успешная активность"
              value={incident.has_success ? "Да" : "Нет"}
            />
          </dl>
        </Section>

        <Section title="Источники и назначение">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <FieldList
              label="IP источника"
              values={
                incident.source_ips.length
                  ? incident.source_ips
                  : incident.source_ip
                    ? [incident.source_ip]
                    : []
              }
            />
            <FieldList
              label="Пользователи источника"
              values={incident.source_users}
            />
            <FieldList label="Хосты источника" values={incident.source_hosts} />
            <FieldList
              label="IP назначения"
              values={
                incident.destination_ips.length
                  ? incident.destination_ips
                  : incident.destination_ip
                    ? [incident.destination_ip]
                    : []
              }
            />
            <FieldList
              label="Хосты назначения"
              values={incident.destination_hosts}
            />
            <FieldList label="Целевые порты" values={incident.target_ports} />
            <FieldList
              label="Целевые пользователи"
              values={incident.target_users}
            />
            <Field label="Наблюдаемый хост" value={incident.observer_host} />
            <Field label="Ключ сессии" value={incident.session_key} />
          </dl>
        </Section>

        <div className="grid gap-5 xl:grid-cols-2">
          <Section title="MITRE ATT&CK">
            <dl className="grid gap-y-5">
              <FieldList label="Идентификаторы" values={incident.mitre_ids} />
              <FieldList label="Тактики" values={incident.tactics} />
              <Field label="Kill chain" value={incident.kill_chain} />
              <Field label="Attack ID" value={incident.attack_id} />
              <FieldList label="Сценарии" values={incident.scenario_ids} />
            </dl>
          </Section>
          <Section title="Детекция">
            <dl className="grid gap-y-5">
              <FieldList
                label="Категории"
                values={incident.detection_categories}
              />
              <FieldList
                label="ID правил"
                values={incident.detection_rule_ids}
              />
              <FieldList
                label="Описания правил"
                values={incident.detection_rule_descriptions}
              />
              <FieldList label="Сигнатуры" values={incident.signatures} />
              <FieldList label="Имена атак" values={incident.attack_names} />
              <FieldList
                label="Уверенность, %"
                values={incident.detection_confidences}
              />
            </dl>
          </Section>
        </div>

        <Section title="События и сетевые артефакты">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field label="Сырых событий" value={incident.event_count} />
            <Field label="Микроинцидентов" value={incident.micro_incidents} />
            <Field
              label="Уникальных источников"
              value={incident.unique_sources}
            />
            <FieldList
              label="Источники данных"
              values={incident.source_ids ?? []}
            />
            <FieldList
              label="Типы журналов"
              values={incident.log_source_types}
            />
            <FieldList label="Продукты" values={incident.product_names} />
            <FieldList label="Поставщики" values={incident.vendor_names} />
            <FieldList label="URL" values={incident.urls} />
            <FieldList label="Request URI" values={incident.request_uris} />
            <FieldList label="HTTP-методы" values={incident.http_methods} />
            <FieldList label="HTTP-статусы" values={incident.http_statuses} />
            <FieldList
              label="Индикаторы payload"
              values={incident.payload_indicators}
            />
            <Field label="Тип payload" value={incident.payload_type} />
            <FieldList label="User-Agent" values={incident.user_agents} />
            <FieldList label="Коды событий" values={incident.event_codes} />
          </dl>
        </Section>

        <Section title="Системный контекст">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <FieldList label="Компьютеры" values={incident.computer_names} />
            <FieldList label="Процессы" values={incident.process_names} />
            <FieldList label="Пути процессов" values={incident.process_paths} />
            <FieldList
              label="Командные строки"
              values={incident.process_command_lines}
            />
            <FieldList
              label="Родительские процессы"
              values={incident.parent_process_names}
            />
            <FieldList
              label="Пути родительских процессов"
              values={incident.parent_process_paths}
            />
            <FieldList
              label="Командные строки родительских процессов"
              values={incident.parent_process_command_lines}
            />
            <FieldList label="Файлы" values={incident.file_paths} />
            <FieldList label="SHA-256" values={incident.sha256_hashes ?? []} />
            <FieldList label="MD5" values={incident.md5_hashes ?? []} />
            <FieldList label="Ключи реестра" values={incident.registry_keys} />
            <FieldList label="Службы" values={incident.service_names} />
            <FieldList label="Задачи" values={incident.task_names} />
          </dl>
        </Section>

        <div className="grid gap-5 xl:grid-cols-2">
          <Section title="Подавление">
            <dl className="grid gap-y-5">
              <Field
                label="Подавлен"
                value={incident.suppressed ? "Да" : "Нет"}
              />
              <Field label="Режим" value={incident.suppression_mode} />
              <Field label="Правило" value={incident.suppression_rule} />
              <Field label="Причина" value={incident.suppression_reason} />
            </dl>
          </Section>
          <Section title="Анализ и рекомендации">
            <dl className="grid gap-y-5">
              <FieldList
                label="Пояснения"
                values={incident.explanation ?? []}
              />
              <Field label="AI-анализ" value={incident.ai_analysis} />
              <FieldList
                label="Рекомендации"
                values={incident.recommendations}
              />
            </dl>
          </Section>
        </div>

        <Section title="Служебные данные">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Elastic index" value={incident._elastic_index} />
            <Field label="Elastic ID" value={incident._elastic_id} />
            <Field
              label="Время события"
              value={formatDate(incident["@timestamp"])}
            />
            <FieldList
              label="Индексы событий"
              values={incident.elastic_event_refs.map(
                (event) => `${event.index} / ${event.id}`,
              )}
            />
            <Field
              label="Дополнительные данные"
              value={
                incident.extra ? JSON.stringify(incident.extra, null, 2) : "—"
              }
            />
          </dl>
        </Section>
      </div>
    </>
  );
}

function IncidentEventItem({ event }: { event: WazuhEvent }) {
  const source =
    event.agent?.name ||
    event.host?.name ||
    event.host?.hostname ||
    event.agent?.ip ||
    event.host?.ip?.join(", ") ||
    "—";

  return (
    <article className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {event.decoder?.name || event.predecoder?.program_name || "Событие"}
          </p>
          <p className="mt-1 break-all font-mono text-xs text-gray-500">
            {event.id || event._elastic_id || "ID не указан"}
          </p>
        </div>
        <time className="shrink-0 text-xs text-gray-500">
          {formatDate(event["@timestamp"] || event.timestamp)}
        </time>
      </div>

      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-xs text-gray-500">Источник</dt>
          <dd className="mt-1 wrap-break-word text-gray-800">{source}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-gray-500">IP агента</dt>
          <dd className="mt-1 wrap-break-word text-gray-800">
            {event.agent?.ip || event.host?.ip?.join(", ") || "—"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-gray-500">Локация</dt>
          <dd className="mt-1 wrap-break-word text-gray-800">
            {event.location || "—"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-gray-500">Менеджер</dt>
          <dd className="mt-1 wrap-break-word text-gray-800">
            {event.manager?.name || "—"}
          </dd>
        </div>
      </dl>

      {event.full_log && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-gray-600">
            Полный журнал
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-md bg-gray-50 p-3 text-xs whitespace-pre-wrap wrap-break-word text-gray-700">
            {event.full_log}
          </pre>
        </details>
      )}
    </article>
  );
}

export default function IncidentDetail({ incidentId }: IncidentDetailProps) {
  const router = useRouter();
  const { data, isPending, error, refetch } = useIncidentDetai(incidentId);

  return (
    <main className="mx-auto max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/incidents")}
        className="mb-4 -ml-3"
      >
        <ArrowLeft /> К списку инцидентов
      </Button>

      {isPending ? (
        <div className="space-y-5" aria-label="Загрузка инцидента">
          <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-rose-500" />
          <h1 className="font-semibold text-gray-900">
            Не удалось загрузить инцидент
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Проверьте подключение и попробуйте еще раз.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Повторить попытку
          </Button>
        </div>
      ) : data?.incident ? (
        <IncidentContent incident={data.incident} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">
          Инцидент не найден
        </div>
      )}
    </main>
  );
}
