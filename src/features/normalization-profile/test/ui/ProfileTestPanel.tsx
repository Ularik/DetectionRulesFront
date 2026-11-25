"use client";

import { useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, CircleX, Play, RotateCcw } from "lucide-react";
import { CopyButton } from "@/shared/ui/copy-button";
import { JsonCode } from "@/shared/ui/json-code";
import { cn } from "@/shared/lib/utils";
import { getErrorMessage } from "@/shared/lib/errors";
import {
  buildSampleRawEvent,
  type NormalizationProfileType,
  type NormalizationTestResult,
} from "@/entities/normalization-profile";
import { useTestNormalizationProfile } from "../model/useTestProfile";

const toJson = (value: unknown) => JSON.stringify(value, null, 2);

// Результат в терминах профиля: только поля из field_mapping, которые удалось заполнить
function mappedResult(result: NormalizationTestResult) {
  return Object.fromEntries(
    result.quality.mapped_fields.map(({ field }) => [field, result.unified[field]]),
  );
}

function QualityBadge({ result }: { result: NormalizationTestResult }) {
  const { quality } = result;
  const hasErrors = quality.parse_errors.length > 0;
  const applied = quality.mapped_fields_count > 0 && !hasErrors;
  const full = applied && quality.missing_mapped_fields_count === 0;

  const [Icon, label, className] = hasErrors
    ? [CircleX, "Ошибка разбора", "bg-red-50 text-red-700"]
    : full
      ? [CircleCheck, "Профиль применён", "bg-emerald-50 text-emerald-700"]
      : applied
        ? [CircleAlert, "Применён частично", "bg-amber-50 text-amber-700"]
        : [CircleAlert, "Поля не найдены", "bg-amber-50 text-amber-700"];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium", className)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

const asText = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value));

function ResultDetails({ result }: { result: NormalizationTestResult }) {
  const { quality } = result;
  const notes: ReactNode[] = [
    ...quality.missing_mapped_fields.map((item) => {
      const field = typeof item === "string" ? item : item.field;
      return `Не найдено в событии: ${field}`;
    }),
    ...quality.parse_errors.map(asText),
    ...quality.warnings.map(asText),
  ];

  return (
    <div className="flex flex-col gap-2 text-xs text-ink">
      <p className="text-ink-muted">
        Сопоставлено полей: <span className="font-semibold text-ink">{quality.mapped_fields_count}</span> из{" "}
        {quality.configured_fields} · покрытие{" "}
        <span className="font-semibold text-ink">{Math.round(quality.coverage_percent)}%</span>
      </p>
      {notes.length > 0 && (
        <ul className="list-inside list-disc space-y-0.5 text-amber-700">
          {notes.map((note, index) => (
            <li key={index} className="break-words">
              {note}
            </li>
          ))}
        </ul>
      )}
      <details className="rounded-lg border border-line-muted">
        <summary className="cursor-pointer px-3 py-2 text-ink-muted hover:text-ink">
          Полная нормализованная запись
        </summary>
        <JsonCode value={result.normalized} className="max-h-80 rounded-none border-0 border-t" />
      </details>
    </div>
  );
}

// Редактор JSON с номерами строк (textarea без переноса + колонка номеров)
function JsonEditor({ value, onChange, rows }: { value: string; onChange: (value: string) => void; rows: number }) {
  const lineCount = Math.max(value.split("\n").length, 1);
  return (
    <div
      className="flex overflow-auto rounded-lg border border-line-muted bg-surface-muted py-2 font-mono text-[11px] leading-[18px] focus-within:border-brand-light focus-within:ring-2 focus-within:ring-brand-light/20"
      style={{ height: rows * 18 + 18 }}
    >
      <div aria-hidden className="w-8 shrink-0 pr-3 text-right text-ink-muted select-none">
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        wrap="off"
        aria-label="Исходное событие (JSON)"
        className="min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-ink outline-none"
        style={{ height: lineCount * 18, minHeight: "100%" }}
      />
    </div>
  );
}

type Props = {
  profile: NormalizationProfileType;
  /** compact — колонка справа от таблицы сопоставления; wide — отдельная вкладка «Тест профиля» */
  layout?: "compact" | "wide";
};

// Быстрый тест профиля: POST /normalization-profiles/test с профилем и raw-событием
export function ProfileTestPanel({ profile, layout = "compact" }: Props) {
  const sample = () => toJson(buildSampleRawEvent(profile.field_mapping));
  const [rawEvent, setRawEvent] = useState(sample);
  const [parseError, setParseError] = useState<string | null>(null);
  const test = useTestNormalizationProfile();

  const handleRun = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawEvent);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Некорректный JSON");
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setParseError("Событие должно быть JSON-объектом");
      return;
    }
    setParseError(null);
    test.mutate({ profile, raw_event: parsed as Record<string, unknown> });
  };

  const wide = layout === "wide";
  const result = test.data;
  const resultJson = result ? toJson(mappedResult(result)) : "";

  return (
    <section className={cn("flex flex-col gap-3", !wide && "rounded-xl border border-line p-4")}>
      <header>
        <h3 className="text-base font-semibold text-ink">Быстрый тест профиля</h3>
        <p className="text-xs text-ink-muted">
          Проверьте, как событие будет нормализовано с текущими правилами. Профиль при этом не сохраняется.
        </p>
      </header>

      <div className={cn("grid gap-4", wide && "lg:grid-cols-2")}>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ink">Исходное событие (JSON)</span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setRawEvent(sample());
                  setParseError(null);
                }}
                aria-label="Подставить пример события"
                title="Подставить пример события"
                className="inline-flex size-7 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink"
              >
                <RotateCcw className="size-4" />
              </button>
              <CopyButton value={rawEvent} label="Копировать событие" />
            </span>
          </div>
          <JsonEditor value={rawEvent} onChange={setRawEvent} rows={wide ? 18 : 9} />
          {parseError && <p className="text-xs text-red-600">Ошибка JSON: {parseError}</p>}
          <button
            type="button"
            onClick={handleRun}
            disabled={test.isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-light px-4 text-sm font-semibold text-white transition-colors hover:bg-brand disabled:opacity-70"
          >
            <Play className="size-4" aria-hidden />
            {test.isPending ? "Проверка..." : "Проверить"}
          </button>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-h-7 items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ink">Результат нормализации</span>
            {result && !test.isPending && <QualityBadge result={result} />}
          </div>

          {test.isError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(test.error, "Не удалось проверить профиль")}
            </p>
          ) : result ? (
            <>
              <div className="relative">
                <JsonCode value={resultJson} className={wide ? "max-h-[342px]" : "max-h-64"} />
                <CopyButton value={resultJson} label="Копировать результат" className="absolute top-1.5 right-1.5 bg-white/80" />
              </div>
              <ResultDetails result={result} />
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-ink-muted">
              Нажмите «Проверить», чтобы увидеть результат
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
