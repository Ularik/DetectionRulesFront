"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  getEventDestinationIp,
  getEventSourceIp,
  getEventTimestamp,
  useEvent,
  type WazuhEvent,
} from "@/entities/event";

// Вёрстка по фрейму «modal» раздела Raw data макета CERT-KG SIEM (Figma 536:5720)

type Value = string | number | boolean | null | undefined;

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function formatDateTime(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

function isEmpty(value: Value | Value[]) {
  if (Array.isArray(value)) return value.length === 0;
  return value === null || value === undefined || value === "";
}

// Строка «ключ — значение» с колонкой ключа 220px, как в макете
function Row({ label, value, mono }: { label: string; value: Value | Value[]; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-xs font-medium text-[#6b7280] sm:w-[220px]">{label}</dt>
      <dd
        className={cn(
          "min-w-0 flex-1 text-[13px] break-words text-[#111827]",
          mono && "font-mono",
        )}
      >
        {isEmpty(value) ? (
          "—"
        ) : Array.isArray(value) ? (
          value.map((item, index) => <div key={index}>{String(item)}</div>)
        ) : (
          String(value)
        )}
      </dd>
    </div>
  );
}

function Card({
  title,
  children,
  muted,
}: {
  title: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-[10px] border border-[#e5e7eb] p-4",
        muted ? "bg-[#f8fafc]" : "bg-white",
      )}
    >
      <h2 className="rounded-[10px] bg-[#f2f9ff] text-sm font-semibold text-[#111827]">{title}</h2>
      <dl className="flex flex-col gap-2.5">{children}</dl>
    </section>
  );
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs font-semibold text-[#6b7280]">{label}</span>
      <span className="min-w-0 text-right text-sm break-all text-[#111827]">{children}</span>
    </div>
  );
}

function EventContent({ event, indexName, eventId }: { event: WazuhEvent; indexName: string; eventId: string }) {
  const source = event.source_context;
  const title = event.id || eventId;
  const index = event._elastic_index ?? indexName;
  const elasticId = event._elastic_id ?? eventId;

  const copyId = () => {
    navigator.clipboard
      .writeText(title)
      .then(() => toast.success("ID события скопирован"))
      .catch(() => toast.error("Не удалось скопировать ID"));
  };

  return (
    <div className="flex flex-col gap-6 px-[26px] py-6">
      <header className="flex flex-col gap-4 pr-8">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="text-2xl font-semibold break-all text-[#111827] sm:text-[32px]">
            Событие {title}
          </h1>
          <button
            type="button"
            onClick={copyId}
            aria-label="Скопировать ID события"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#d9ebfc] bg-[#f2f9ff] text-[#0965c5] hover:bg-[#e6f4ff]"
          >
            <Copy className="size-4" />
          </button>
        </div>
        <p className="text-lg font-medium break-all text-[#6b7280] sm:text-xl">Индекс: {index}</p>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex w-full max-w-[288px] flex-col gap-2.5 rounded-[10px] border border-[#e5e7eb] bg-[#f8fafc] p-3.5">
            <SummaryRow label="Источник">
              {source?.source_name ? (
                <span className="inline-flex rounded-full bg-[#e6f4ff] px-2 py-1 text-xs font-semibold text-[#0965c5]">
                  {source.source_name}
                </span>
              ) : (
                "—"
              )}
            </SummaryRow>
            <SummaryRow label="Тип">
              <span className="font-mono font-semibold capitalize">{source?.source_type || "—"}</span>
            </SummaryRow>
            <SummaryRow label="Организация">
              <span className="font-mono font-semibold">{source?.organization_id || "—"}</span>
            </SummaryRow>
            <SummaryRow label="ID источника">
              <span className="font-semibold">{source?.source_id || "—"}</span>
            </SummaryRow>
          </div>

          <div className="flex w-full max-w-[581px] flex-col gap-2.5 rounded-[10px] border border-[#e5e7eb] bg-[#f8fafc] p-3.5">
            <div className="grid gap-1 sm:grid-cols-[1fr_305px]">
              <span className="text-xs font-semibold text-[#6b7280]">Elasticsearch Index</span>
              <span className="text-xs break-all text-black">{index}</span>
            </div>
            <div className="grid gap-1 sm:grid-cols-[1fr_305px]">
              <span className="text-xs font-semibold text-[#6b7280]">Elasticsearch ID</span>
              <span className="font-mono text-sm break-all text-[#111827]">{elasticId}</span>
            </div>
            <div className="grid gap-1 sm:grid-cols-[1fr_305px]">
              <span className="text-xs font-semibold text-[#6b7280]">Event Reference</span>
              <span className="font-mono text-sm break-all text-[#111827]">
                {`{"index": "${event.event_ref?.index ?? index}"}`}
                <br />
                {`{"id": "${event.event_ref?.id ?? elasticId}"}`}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card title="Основная информация">
            <Row label="event_id" value={event.id} mono />
            <Row label="timestamp" value={formatDateTime(event.timestamp)} />
            <Row label="program" value={event.predecoder?.program_name} />
            <Row label="@timestamp" value={formatDateTime(getEventTimestamp(event))} />
            <Row label="Location" value={event.location} />
          </Card>

          <Card title="Агент" muted>
            <Row label="Agent ID" value={event.agent?.id} />
            <Row label="Agent Name" value={event.agent?.name} />
            <Row label="Agent Type" value={event.agent?.type} />
            <Row label="Agent Version" value={event.agent?.version} />
            <Row label="Agent IP" value={event.agent?.ip} />
            <Row label="Ephemeral ID" value={event.agent?.ephemeral_id} />
          </Card>

          <Card title="Decoder and log">
            <Row label="Decoder Name" value={event.decoder?.name} mono />
            <Row label="Parent Decoder" value={event.decoder?.parent} mono />
            <Row label="Predecoder Hostname" value={event.predecoder?.hostname} mono />
            <Row label="Predecoder Program" value={event.predecoder?.program_name} mono />
            <Row label="Predecoder Time" value={event.predecoder?.timestamp} />
            <Row label="Manager" value={event.manager?.name} />
            <Row label="Input Type" value={event.input?.type} mono />
            <Row label="File Path" value={event.log?.file?.path} mono />
            <Row label="File Offset" value={event.log?.offset} mono />
            <Row label="Device ID" value={event.log?.file?.device_id} />
            <Row label="Inode" value={event.log?.file?.inode} />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Сетевая информация">
            <Row label="Source IP" value={getEventSourceIp(event)} />
            <Row label="Source Port" value={event.data?.srcport ?? event.source?.port} />
            <Row label="Destination IP" value={getEventDestinationIp(event)} />
            <Row label="Destination Port" value={event.data?.dstport ?? event.destination?.port} />
            <Row label="Protocol" value={event.data?.protocol} />
            <Row label="Agent IP" value={event.agent?.ip} />
            <Row label="Host IP" value={event.host?.ip} />
          </Card>

          <Card title="Пользователь">
            <Row label="Source User" value={event.data?.srcuser} />
            <Row label="Destination User" value={event.data?.dstuser} />
          </Card>

          <Card title="Host / OS">
            <Row label="Host Name" value={event.host?.name ?? event.host?.hostname} />
            <Row label="Host ID" value={event.host?.id} />
            <Row label="MAC" value={event.host?.mac} />
            <Row label="Architecture" value={event.host?.architecture} />
            <Row label="OS Name" value={event.host?.os?.name} />
            <Row label="OS Version" value={event.host?.os?.version} />
            <Row label="OS Family" value={event.host?.os?.family} />
            <Row label="OS Platform" value={event.host?.os?.platform} />
            <Row label="OS Type" value={event.host?.os?.type} />
            <Row label="OS Codename" value={event.host?.os?.codename} />
            <Row label="Kernel" value={event.host?.os?.kernel} />
            <Row
              label="Containerized"
              value={event.host?.containerized === undefined ? null : event.host?.containerized}
            />
          </Card>
        </div>
      </div>

      {event.full_log && (
        <section className="flex flex-col gap-3 rounded-[10px] border border-[#e5e7eb] bg-white p-4">
          <h2 className="rounded-[10px] bg-[#f2f9ff] text-sm font-semibold text-[#111827]">Full log</h2>
          <pre className="max-h-64 overflow-auto rounded-md bg-[#f8fafc] p-3 font-mono text-xs whitespace-pre-wrap break-words text-[#111827]">
            {event.full_log}
          </pre>
        </section>
      )}
    </div>
  );
}

// Загрузка, ошибка и содержимое события — без навигации, чтобы переиспользовать в модалке
export function EventDetailsBody({ indexName, eventId }: { indexName: string; eventId: string }) {
  const { data, isPending, error, refetch } = useEvent({ index_name: indexName, event_id: eventId });

  if (isPending) {
    return (
      <div className="space-y-5 p-6" aria-label="Загрузка события">
        <div className="h-20 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-72 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-6 py-16 text-center">
        <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-rose-500" />
        <p className="font-semibold text-gray-900">
          {error ? "Не удалось загрузить событие" : "Событие не найдено"}
        </p>
        {error && (
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Повторить попытку
          </Button>
        )}
      </div>
    );
  }

  return <EventContent event={data} indexName={indexName} eventId={eventId} />;
}

export function EventDetails({ indexName, eventId }: { indexName: string; eventId: string }) {
  return (
    <div>
      <Button variant="ghost" asChild className="mb-4 -ml-3">
        <Link href={routes.events}>
          <ArrowLeft /> К Raw data
        </Link>
      </Button>
      <div className="rounded-[10px] border border-[#e5e7eb] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
        <EventDetailsBody indexName={indexName} eventId={eventId} />
      </div>
    </div>
  );
}
