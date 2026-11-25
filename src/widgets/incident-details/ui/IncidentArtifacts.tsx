"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Fingerprint } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CopyButton } from "@/shared/ui/copy-button";
import { PaginationControl } from "@/shared/ui/pagination";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import {
  useIncidentArtifacts,
  type IncidentArtifact,
  type IncidentArtifactEvent,
} from "@/entities/incident";

// Блок «Артефакты» карточки инцидента: GET /incidents/{id}/artifacts.
// Backend не дедуплицирует артефакты и пагинирует по событиям, поэтому сверху — уникальные
// значения текущей страницы, ниже — события с их артефактами

const ARTIFACT_TYPES: Record<string, { label: string; className: string }> = {
  command: { label: "Команда", className: "bg-violet-50 text-violet-700 border-violet-200" },
  ip: { label: "IP", className: "bg-sky-50 text-sky-700 border-sky-200" },
  file: { label: "Файл", className: "bg-amber-50 text-amber-700 border-amber-200" },
  hash: { label: "Хэш", className: "bg-slate-100 text-slate-700 border-slate-200" },
  user: { label: "Пользователь", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  domain: { label: "Домен", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  url: { label: "URL", className: "bg-blue-50 text-blue-700 border-blue-200" },
  process: { label: "Процесс", className: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  host: { label: "Хост", className: "bg-teal-50 text-teal-700 border-teal-200" },
};

const getArtifactType = (type: string) =>
  ARTIFACT_TYPES[type.toLowerCase()] ?? {
    label: type,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };

const MITRE_ID_PATTERN = /^T\d{4}(?:\.\d{3})?$/;

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  // backend отдаёт смещение без двоеточия (+0600) — приводим к ISO
  const date = new Date(value.replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function ArtifactTypeBadge({ type }: { type: string }) {
  const { label, className } = getArtifactType(type);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-md border px-1.5 text-[11px] leading-5 font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
}

// Каждый артефакт — в своей рамке, чтобы соседние значения не сливались
function ArtifactValue({
  artifact,
  count,
  title,
}: {
  artifact: IncidentArtifact;
  /** Сколько раз значение встретилось (для списка уникальных) */
  count?: number;
  title?: string;
}) {
  return (
    <div
      title={title}
      className="flex min-w-0 items-start gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-[#b9d7f5]"
    >
      {count !== undefined && (
        <span className="order-last mt-0.5 shrink-0 rounded-md bg-gray-100 px-1.5 text-[11px] leading-5 text-gray-600">
          ×{count}
        </span>
      )}
      <ArtifactTypeBadge type={artifact.type} />
      <code
        title={`Поле: ${artifact.field}`}
        className="min-w-0 flex-1 font-mono text-[13px] break-all text-gray-900"
      >
        {artifact.value}
      </code>
      <CopyButton
        value={artifact.value}
        label="Скопировать артефакт"
        successMessage="Артефакт скопирован"
        className="shrink-0"
      />
    </div>
  );
}

/** Уникальные артефакты страницы: тип + значение → сколько раз встретились и в каких полях */
function summarize(events: IncidentArtifactEvent[]) {
  const map = new Map<string, IncidentArtifact & { count: number; fields: Set<string> }>();
  for (const event of events) {
    for (const artifact of event.artifacts) {
      const key = `${artifact.type}\u0000${artifact.value}`;
      const entry = map.get(key);
      if (entry) {
        entry.count += 1;
        entry.fields.add(artifact.field);
      } else {
        map.set(key, { ...artifact, count: 1, fields: new Set([artifact.field]) });
      }
    }
  }
  return [...map.values()].sort(
    (a, b) => a.type.localeCompare(b.type) || b.count - a.count || a.value.localeCompare(b.value),
  );
}

function ArtifactEventRow({ event }: { event: IncidentArtifactEvent }) {
  const eventHref = event.event_ref ? routes.event(event.event_ref.index, event.event_ref.id) : null;

  return (
    <article className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {event.rule_description || "Событие"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <time>{formatTimestamp(event.timestamp)}</time>
            {event.rule_id && <span>Правило {event.rule_id}</span>}
            {event.rule_level !== null && <span>Уровень {event.rule_level}</span>}
            {(event.hostname || event.source_name) && (
              <span>
                {[event.hostname, event.source_name].filter(Boolean).join(" · ")}
              </span>
            )}
            {event.action && <span>Действие: {event.action}</span>}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {event.mitre_ids.map((mitreId) =>
            MITRE_ID_PATTERN.test(mitreId) ? (
              <Link
                key={mitreId}
                href={routes.mitreTechnique(mitreId)}
                className="rounded-md bg-[#f2f9ff] px-1.5 font-mono text-xs leading-5 text-[#0965c5] hover:underline"
              >
                {mitreId}
              </Link>
            ) : (
              <span key={mitreId} className="font-mono text-xs text-gray-600">
                {mitreId}
              </span>
            ),
          )}
          {eventHref && (
            <Link
              href={eventHref}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0965c5] hover:underline"
            >
              RAW-событие
              <ExternalLink className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      {event.artifacts.length ? (
        <div className="flex flex-col gap-1.5 rounded-lg bg-surface-muted p-2">
          {event.artifacts.map((artifact, index) => (
            <ArtifactValue key={`${artifact.field}-${index}`} artifact={artifact} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Артефакты не извлечены</p>
      )}
    </article>
  );
}

export function IncidentArtifacts({
  incidentId,
  className,
}: {
  incidentId: string;
  className?: string;
}) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { data, isPending, isError, isFetching, refetch } = useIncidentArtifacts({
    incidentId,
    page,
    size,
  });

  const events = data?.items ?? [];
  const unique = summarize(events);
  const artifactsOnPage = events.reduce((sum, event) => sum + event.artifacts.length, 0);

  return (
    <section
      className={cn("flex flex-col gap-4 rounded-[10px] border border-gray-200 bg-white p-4", className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Fingerprint className="size-4 text-[#0965c5]" />
          Артефакты
        </h2>
        {data && (
          <p className="text-xs text-gray-500">
            {artifactsOnPage} артефактов в {events.length} из {data.total} событий
          </p>
        )}
      </div>

      {isPending ? (
        <div className="space-y-3" aria-label="Загрузка артефактов">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-600">Не удалось загрузить артефакты инцидента.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : events.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          В связанных событиях артефакты не найдены.
        </p>
      ) : (
        <>
          {data.missing_count > 0 && (
            <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="size-4 shrink-0" />
              Не удалось прочитать связанных событий: {data.missing_count}
            </p>
          )}

          {unique.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-gray-500">
                Уникальные значения на странице ({unique.length})
              </h3>
              <ul className="flex flex-col gap-1.5">
                {unique.map((artifact) => (
                  <li key={`${artifact.type}-${artifact.value}`}>
                    <ArtifactValue
                      artifact={artifact}
                      count={artifact.count}
                      title={`Поля: ${[...artifact.fields].join(", ")}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-gray-500">По событиям</h3>
            {/* В модалке блок стоит в узкой колонке — длинный список прокручивается внутри */}
            <div
              className={cn(
                "max-h-140 divide-y divide-gray-200 overflow-y-auto pr-1",
                isFetching && "opacity-60",
              )}
            >
              {events.map((event, index) => (
                <ArtifactEventRow
                  key={event.event_ref ? `${event.event_ref.index}/${event.event_ref.id}` : `${event.event_id}-${index}`}
                  event={event}
                />
              ))}
            </div>
          </div>

          {/* 5 — минимальный размер страницы в PaginationControl */}
          {data.total > 5 && (
            <PaginationControl
              page={page}
              limit={size}
              total={data.total}
              onPageChange={setPage}
              onLimitChange={(next) => {
                setSize(next);
                setPage(1);
              }}
              isLoading={isFetching}
              itemsLabel="событий"
              className="sm:flex-wrap"
            />
          )}
        </>
      )}
    </section>
  );
}
