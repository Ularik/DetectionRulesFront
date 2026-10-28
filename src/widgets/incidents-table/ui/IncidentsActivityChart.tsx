import { CircleDashed } from "lucide-react";
import type { DailyIncidentCount } from "@/entities/incident";

type Props = {
  dailyCounts: DailyIncidentCount[];
  periodLabel: string;
  isPending: boolean;
};

const TICKS = 4;

// Ближайший целый «круглый» шаг шкалы: 1, 2, 5 × 10^n (2.5 — только от 10, чтобы шаг оставался целым)
function getNiceStep(rawStep: number) {
  if (rawStep <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const steps = magnitude >= 10 ? [1, 2, 2.5, 5, 10] : [1, 2, 5, 10];
  const nice = steps.find((step) => step >= normalized) ?? 10;
  return nice * magnitude;
}

const dayFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

// Нормализует ответ бэкенда: сортировка по дате, невалидные даты отбрасываются
function toDays(items: DailyIncidentCount[]) {
  return items
    .map((item) => ({ date: new Date(item.date), count: item.count }))
    .filter((item) => !Number.isNaN(item.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function IncidentsActivityChart({ dailyCounts, periodLabel, isPending }: Props) {
  const days = toDays(dailyCounts);
  const maxCount = Math.max(1, ...days.map((day) => day.count));
  const step = Math.max(1, getNiceStep(maxCount / TICKS));
  const axisMax = step * TICKS;
  const ticks = Array.from({ length: TICKS + 1 }, (_, index) => axisMax - index * step);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-[0_8px_12px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Активность инцидентов</h2>
        <div className="flex items-center gap-2 rounded-full bg-surface-muted px-2.5 py-1.5 text-[13px] text-ink">
          <CircleDashed className="size-5 text-[#0088ff]" />
          {periodLabel}
        </div>
      </div>

      <div className="flex h-[108px] gap-3">
        <div className="flex w-10 shrink-0 flex-col items-end justify-between text-xs text-ink-muted">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[14px] border border-line-muted bg-surface-muted">
          {ticks.map((tick, index) => (
            <div
              key={tick}
              className="absolute inset-x-0 h-px bg-line-muted"
              style={{ top: `${(index / TICKS) * 100}%` }}
            />
          ))}

          {isPending ? (
            <div className="absolute inset-0 animate-pulse bg-line-muted/40" />
          ) : days.length === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted">
              Нет данных за период
            </p>
          ) : (
            <div className="absolute inset-0 flex items-end">
              {days.map((day) => (
                <div key={day.date.toDateString()} className="flex h-full flex-1 items-end justify-center">
                  <div
                    className="w-6 rounded-t-lg bg-[#8fcdf1] transition-colors hover:bg-brand-light"
                    style={{ height: `${(day.count / axisMax) * 100}%` }}
                    title={`${dayFormatter.format(day.date)}: ${day.count}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {days.length > 0 && !isPending && (
        <div className="ml-[52px] flex gap-0">
          {days.map((day) => (
            <span
              key={day.date.toDateString()}
              className="flex-1 truncate text-center text-xs text-ink-muted"
            >
              {dayFormatter.format(day.date)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
