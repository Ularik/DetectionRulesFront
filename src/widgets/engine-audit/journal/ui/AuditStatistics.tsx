"use client";

import {
  EngineActionBadge,
  getEngineActionLabel,
  getEngineResourceLabel,
  resolveEngineAction,
  type EngineActionKind,
  type EngineAuditType,
} from "@/entities/audit";

// Вкладка «Статистика»: распределение отфильтрованных записей по действиям, типам объектов,
// пользователям и дням. Одна мера на график, полосы одного цвета — сравниваются длины

const BAR_COLOR = "#2165aa";

function countBy<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, number>();
  for (const item of items) map.set(key(item), (map.get(key(item)) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function BarList({
  title,
  rows,
  renderLabel,
  limit = 10,
}: {
  title: string;
  rows: [string, number][];
  renderLabel?: (key: string) => React.ReactNode;
  limit?: number;
}) {
  const max = rows[0]?.[1] ?? 1;
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">Нет данных</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.slice(0, limit).map(([key, count]) => (
            <li
              key={key}
              title={`${key}: ${count.toLocaleString("ru-RU")}`}
              className="grid grid-cols-[minmax(0,160px)_minmax(0,1fr)_48px] items-center gap-3 text-[13px]"
            >
              <span className="min-w-0 truncate text-ink">{renderLabel ? renderLabel(key) : key}</span>
              <span className="h-3 rounded-r bg-line-muted/60">
                <span
                  className="block h-full rounded-r"
                  style={{ width: `${Math.max((count / max) * 100, 2)}%`, backgroundColor: BAR_COLOR }}
                />
              </span>
              <span className="text-right font-medium text-ink tabular-nums">{count.toLocaleString("ru-RU")}</span>
            </li>
          ))}
        </ul>
      )}
      {rows.length > limit && <p className="text-xs text-ink-muted">И ещё {rows.length - limit}</p>}
    </section>
  );
}

export function AuditStatistics({ items }: { items: EngineAuditType[] }) {
  const labelByKind = new Map<string, { kind: EngineActionKind; label: string }>();
  const byAction = countBy(items, (item) => {
    const label = getEngineActionLabel(item);
    labelByKind.set(label, { kind: resolveEngineAction(item), label });
    return label;
  });
  const byResource = countBy(items, (item) => getEngineResourceLabel(item.resource_type));
  const byUser = countBy(items, (item) => item.actor ?? "система");
  const byDay = countBy(items, (item) => item.timestamp.slice(0, 10)).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <BarList
        title="По действиям"
        rows={byAction}
        renderLabel={(key) => {
          const entry = labelByKind.get(key);
          return entry ? <EngineActionBadge kind={entry.kind} label={entry.label} /> : key;
        }}
      />
      <BarList title="По типам объектов" rows={byResource} />
      <BarList title="По пользователям" rows={byUser} />
      <BarList
        title="По дням (последние 14)"
        rows={byDay}
        limit={14}
        renderLabel={(key) => key.split("-").reverse().join(".")}
      />
    </div>
  );
}
