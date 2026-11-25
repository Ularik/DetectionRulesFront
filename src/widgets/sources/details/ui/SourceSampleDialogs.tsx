"use client";

import { useState } from "react";
import { BarChart3, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";
import {
  SourceTag,
  formatSourceDateTime,
  useSourceSampleEvents,
  type SourceSampleEvent,
} from "@/entities/source";

const SIZE_OPTIONS = [5, 10, 20, 50];

const footerButtonClass =
  "inline-flex h-9 items-center gap-2 rounded-lg border border-ink/70 bg-white px-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted";

const dialogClass = "max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white sm:max-w-3xl";

function SizeSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      Событий в выборке:
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-8 rounded-lg border border-line bg-white px-2 text-sm text-ink"
      >
        {SIZE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StateMessage({ children, isError }: { children: string; isError?: boolean }) {
  return (
    <p className={cn("py-10 text-center text-sm", isError ? "text-red-600" : "text-ink-muted")}>
      {children}
    </p>
  );
}

function getString(event: SourceSampleEvent, key: string) {
  const value = event[key];
  return typeof value === "string" ? value : null;
}

// Значение по пути «a.b.c» во вложенном объекте события
function getByPath(event: SourceSampleEvent, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, event);
}

const isFilled = (value: unknown) =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  !(Array.isArray(value) && value.length === 0);

function SampleEventsBody({ sourceId, size }: { sourceId: string; size: number }) {
  const { data, isPending, isError } = useSourceSampleEvents(sourceId, size);

  if (isPending) return <StateMessage>Загрузка событий...</StateMessage>;
  if (isError) return <StateMessage isError>Не удалось загрузить примеры событий</StateMessage>;
  if (!data.items.length) return <StateMessage>Событий от источника пока нет</StateMessage>;

  return (
    <ol className="flex flex-col gap-3">
      {data.items.map((event, index) => {
        const id = getString(event, "_elastic_id") ?? getString(event, "id") ?? String(index);
        const message = getString(event, "full_log");
        return (
          <li key={`${id}-${index}`} className="rounded-[10px] border border-line-muted bg-surface-muted">
            <details>
              <summary className="flex cursor-pointer list-none flex-col gap-1 px-3 py-2.5">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                  <span className="font-semibold text-ink">
                    {formatSourceDateTime(getString(event, "@timestamp"))}
                  </span>
                  {getString(event, "location") && <span>{getString(event, "location")}</span>}
                  {getString(event, "_elastic_index") && (
                    <span className="font-mono">{getString(event, "_elastic_index")}</span>
                  )}
                </span>
                <span className="font-mono text-xs break-all text-ink">
                  {message ?? "Без full_log — разверните, чтобы увидеть событие"}
                </span>
              </summary>
              <pre className="max-h-80 overflow-auto border-t border-line-muted px-3 py-2.5 text-[11px] leading-relaxed text-ink">
                {JSON.stringify(event, null, 2)}
              </pre>
            </details>
          </li>
        );
      })}
    </ol>
  );
}

export function SampleEventsDialog({ sourceId }: { sourceId: string }) {
  const [size, setSize] = useState(5);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={footerButtonClass}>
          <FileText className="size-4" aria-hidden />
          Примеры событий
        </button>
      </DialogTrigger>
      <DialogContent className={dialogClass}>
        <div className="flex flex-col gap-1 pr-8">
          <DialogTitle>Примеры событий</DialogTitle>
          <DialogDescription>Последние raw-события источника {sourceId}</DialogDescription>
        </div>
        <SizeSelect value={size} onChange={setSize} />
        <SampleEventsBody sourceId={sourceId} size={size} />
      </DialogContent>
    </Dialog>
  );
}

function DataQualityBody({ sourceId, size }: { sourceId: string; size: number }) {
  const { data, isPending, isError } = useSourceSampleEvents(sourceId, size);

  if (isPending) return <StateMessage>Анализ выборки...</StateMessage>;
  if (isError) return <StateMessage isError>Не удалось загрузить выборку событий</StateMessage>;
  if (!data.items.length) return <StateMessage>Событий от источника пока нет — оценивать нечего</StateMessage>;

  // Заполненность каждого найденного поля по выборке; реже всего заполненные — сверху
  const coverage = data.detected_fields
    .map((field) => ({
      field,
      filled: data.items.filter((event) => isFilled(getByPath(event, field))).length,
    }))
    .sort((a, b) => a.filled - b.filled || a.field.localeCompare(b.field));
  const fullyFilled = coverage.filter((item) => item.filled === data.items.length).length;

  const stats = [
    { label: "Событий в выборке", value: data.count },
    { label: "Найдено полей", value: data.detected_fields_count },
    { label: "Заполнены во всех событиях", value: `${fullyFilled} из ${coverage.length}` },
    { label: "Профиль нормализации", value: data.normalization_profile || "—" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[10px] border border-line-muted px-3 py-2">
            <dt className="text-[11px] text-ink-muted">{stat.label}</dt>
            <dd className="mt-1 text-base font-semibold break-words text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-line-muted text-[13px] text-ink">
          <tr>
            <th className="py-2 pr-3 font-semibold">Поле</th>
            <th className="w-[45%] py-2 font-semibold">Заполненность</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-muted">
          {coverage.map(({ field, filled }) => {
            const percent = Math.round((filled / data.items.length) * 100);
            return (
              <tr key={field}>
                <td className="py-1.5 pr-3 font-mono text-xs break-all text-ink">{field}</td>
                <td className="py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          percent === 100 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-400" : "bg-rose-400",
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <SourceTag className="min-w-[52px] tabular-nums">{percent}%</SourceTag>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function DataQualityDialog({ sourceId }: { sourceId: string }) {
  const [size, setSize] = useState(20);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={footerButtonClass}>
          <BarChart3 className="size-4" aria-hidden />
          Качество данных
        </button>
      </DialogTrigger>
      <DialogContent className={dialogClass}>
        <div className="flex flex-col gap-1 pr-8">
          <DialogTitle>Качество данных</DialogTitle>
          <DialogDescription>
            Какие поля приходят в событиях источника и насколько они заполнены (по последним событиям)
          </DialogDescription>
        </div>
        <SizeSelect value={size} onChange={setSize} />
        <DataQualityBody sourceId={sourceId} size={size} />
      </DialogContent>
    </Dialog>
  );
}
