"use client";

import type { DataQualitySummary } from "@/entities/data-quality";
import { formatCount, formatDataQualityDate } from "@/entities/data-quality";
import { MissingFieldsList, ParseErrorsList } from "./SourceQualityPanel";

// Вкладка «Ошибки нормализации»: частые пропуски полей и ошибки разбора по всем источникам (summary)
export function NormalizationIssues({ summary }: { summary: DataQualitySummary | undefined }) {
  if (!summary) {
    return <div className="h-64 animate-pulse rounded-2xl bg-line-muted" />;
  }
  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-ink">Незаполненные поля</h2>
          <span className="text-xs text-ink-muted">Всего пропусков: {formatCount(summary.missing_fields_total)}</span>
        </div>
        <MissingFieldsList stats={summary} />
      </section>
      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-ink">Ошибки разбора</h2>
          <span className="text-xs text-ink-muted">
            Всего: {formatCount(summary.parse_errors_total)} · последняя:{" "}
            {formatDataQualityDate(summary.last_error_at)}
          </span>
        </div>
        <ParseErrorsList stats={summary} />
      </section>
    </div>
  );
}
