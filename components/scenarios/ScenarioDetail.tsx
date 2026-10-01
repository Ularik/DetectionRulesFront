"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useScenarioDetail } from "@/services/scenarios/scenariosQueries";
import type { ScenarioDetailType } from "@/types/scenarios";

interface ScenarioDetailProps {
  scenarioId: string;
}

function display(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-gray-900">
        {value ?? "—"}
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

  return <Field label={label} value={items.length ? items.join(", ") : "—"} />;
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

function ScenarioContent({
  scenario,
  data,
}: {
  scenario: ScenarioDetailType;
  data: NonNullable<ReturnType<typeof useScenarioDetail>["data"]>;
}) {
  return (
    <>
      <header className="mb-6 border-b border-gray-200 pb-5">
        <Link
          href="/admin/hunters/scenarios"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
        >
          <ArrowLeft className="h-4 w-4" />К списку сценариев
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-sm text-gray-500">Детали сценария</p>
            <h1 className="break-all font-mono text-xl font-bold text-gray-950">
              {scenario.scenario_id}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {display(scenario.scenario_type)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
              {display(scenario.status)}
            </span>
            <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
              Аналитик: {display(scenario.analyst_status)}
            </span>
          </div>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Связанные инциденты", value: data.related_incident_count },
          { label: "Сырые события", value: data.raw_event_count },
          { label: "Совпадения IoC", value: data.ioc_match_count },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <p className="text-xs font-medium text-gray-500">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <Section title="Сводка">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Ключ сценария"
              value={display(scenario.scenario_key)}
            />
            <Field
              label="Статус движка"
              value={display(scenario.engine_status)}
            />
            <Field
              label="Первая активность"
              value={formatDate(scenario.first_seen)}
            />
            <Field
              label="Последняя активность"
              value={formatDate(scenario.last_seen)}
            />
            <Field
              label="Критичность IoC"
              value={display(scenario.ioc_severity)}
            />
            <Field
              label="Уверенность IoC"
              value={display(scenario.ioc_confidence)}
            />
            <Field
              label="В черном списке"
              value={scenario.blacklisted ? "Да" : "Нет"}
            />
            <FieldList
              label="Источники черного списка"
              values={scenario.blacklist_sources}
            />
          </dl>
        </Section>

        <Section title="Источник и назначение">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="IP источника" value={display(scenario.source_ip)} />
            <FieldList label="IP источников" values={scenario.source_ips} />
            <Field
              label="Пользователь источника"
              value={display(scenario.source_user)}
            />
            <FieldList
              label="Пользователи источника"
              values={scenario.source_users}
            />
            <FieldList label="Хосты источника" values={scenario.source_hosts} />
            <Field
              label="Узел наблюдения"
              value={display(scenario.observer_host)}
            />
            <Field
              label="IP назначения"
              value={display(scenario.destination_ip)}
            />
            <FieldList
              label="IP назначений"
              values={scenario.destination_ips}
            />
            <Field
              label="Хост назначения"
              value={display(scenario.destination_host)}
            />
            <FieldList
              label="Хосты назначения"
              values={scenario.destination_hosts}
            />
          </dl>
        </Section>

        <Section title="Актив">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="ID актива" value={display(scenario.asset_id)} />
            <Field label="Имя хоста" value={display(scenario.asset_hostname)} />
            <Field label="Тип актива" value={display(scenario.asset_type)} />
            <Field
              label="Критичность"
              value={display(scenario.asset_criticality)}
            />
            <FieldList label="Теги" values={scenario.asset_tags} />
          </dl>
        </Section>

        <Section title="Детекция и рекомендации">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <FieldList label="ID правил" values={scenario.detection_rule_ids} />
            <FieldList
              label="Категории обнаружения"
              values={scenario.detection_categories}
            />
            <FieldList
              label="Описания правил"
              values={scenario.detection_rule_descriptions}
            />
            <FieldList label="Рекомендации" values={scenario.recommendations} />
            <FieldList label="Сигнатуры" values={scenario.signatures} />
            <FieldList label="URI запросов" values={scenario.request_uris} />
            <FieldList label="Payload" values={scenario.payloads} />
          </dl>
        </Section>

        <Section title="MITRE ATT&CK">
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <FieldList label="ID" values={data.mitre.ids} />
            <FieldList label="Тактики" values={data.mitre.tactics} />
            <FieldList label="Техники" values={data.mitre.techniques} />
          </dl>
        </Section>

        <Section title="Индикаторы компрометации">
          {scenario.ioc_matches.length ? (
            <div className="divide-y divide-gray-200">
              {scenario.ioc_matches.map((ioc) => (
                <div
                  key={ioc.ioc_id}
                  className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-4"
                >
                  <Field label="Тип" value={ioc.ioc_type} />
                  <Field label="Значение" value={ioc.value} />
                  <Field label="Угроза" value={ioc.threat_type} />
                  <Field
                    label="Серьезность / уверенность"
                    value={`${ioc.severity} / ${ioc.confidence}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Совпадений IoC нет</p>
          )}
        </Section>

        <Section title="Связанные инциденты">
          {data.related_incidents.length ? (
            <div className="divide-y divide-gray-200">
              {data.related_incidents.map((incident) => (
                <div
                  key={incident.incident_id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/admin/hunters/incidents/${encodeURIComponent(incident.incident_id)}`}
                      className="font-mono text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      {incident.incident_id}
                    </Link>
                    <p className="mt-1 text-xs text-gray-500">
                      {display(incident.attack_type)} ·{" "}
                      {formatDate(incident.start_time)}
                    </p>
                  </div>
                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {display(incident.severity)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Связанных инцидентов нет</p>
          )}
        </Section>
      </div>
    </>
  );
}

export default function ScenarioDetail({ scenarioId }: ScenarioDetailProps) {
  const query = useScenarioDetail(scenarioId);

  if (query.isPending) {
    return (
      <div className="space-y-4" aria-label="Загрузка сценария">
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center">
        <p className="text-sm text-red-700">
          Не удалось загрузить сценарий. Возможно, он был удален.
        </p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-3 text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-950"
        >
          Повторить попытку
        </button>
      </section>
    );
  }

  return (
    <main className="mx-auto max-w-6xl">
      <ScenarioContent scenario={query.data.scenario} data={query.data} />
    </main>
  );
}
