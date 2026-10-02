"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEventDetail } from "@/services/events/eventQueries";
import type { WazuhEvent } from "@/types/events";

interface EventDetailProps {
  indexName: string;
  eventId: string;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function display(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
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

function EventContent({ event }: { event: WazuhEvent }) {
  return (
    <div className="space-y-6">
      <header className="border-b border-gray-200 pb-5">
        <Link
          href="/admin/hunters/events"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
        >
          <ArrowLeft className="h-4 w-4" />К списку событий
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-gray-500">Детали события</p>
            <h1 className="break-all font-mono text-xl font-bold text-gray-950">
              {event.id ?? event._elastic_id ?? "Неизвестный ID"}
            </h1>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700">
            {event._elastic_index ?? "—"}
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Время</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatDate(event["@timestamp"] ?? event.timestamp)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Агент</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {display(event.agent?.name ?? event.agent?.id ?? "—")}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Хост</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {display(event.host?.name ?? event.host?.hostname ?? "—")}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Декодер</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {display(event.decoder?.name ?? "—")}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Основные данные
        </h2>
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          <Field
            label="ID события"
            value={display(event.id ?? event._elastic_id)}
          />
          <Field label="Elastic index" value={display(event._elastic_index)} />
          <Field label="Источник журнала" value={display(event.location)} />
          <Field
            label="Программа"
            value={display(event.predecoder?.program_name)}
          />
          <Field label="Менеджер" value={display(event.manager?.name)} />
          <Field label="IP агента" value={display(event.agent?.ip)} />
          <Field label="IP хоста" value={display(event.host?.ip?.join(", "))} />
          <Field label="Имя хоста" value={display(event.host?.hostname)} />
          <Field label="Тип входа" value={display(event.input?.type)} />
        </dl>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Полный текст
        </h2>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-gray-50 p-4 text-xs text-gray-700">
          {event.full_log ?? "Текст события отсутствует"}
        </pre>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          JSON события
        </h2>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-gray-50 p-4 text-xs text-gray-700">
          {JSON.stringify(event, null, 2)}
        </pre>
      </section>
    </div>
  );
}

export default function EventDetail({ indexName, eventId }: EventDetailProps) {
  const query = useEventDetail({
    index_name: indexName,
    event_id: eventId,
  });

  if (query.isPending) {
    return (
      <div className="space-y-4" aria-label="Загрузка события">
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center">
        <div className="mb-3 flex justify-center text-red-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <p className="text-sm text-red-700">
          Не удалось загрузить событие. Возможно, оно было удалено или
          недоступно.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => query.refetch()}
        >
          Повторить попытку
        </Button>
      </section>
    );
  }

  return <EventContent event={query.data} />;
}
