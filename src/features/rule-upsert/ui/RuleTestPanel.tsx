"use client";

import { useState } from "react";
import axios from "axios";
import { CircleCheck, CircleX, Play, RotateCcw } from "lucide-react";
import type { RuleCreateUpdateType } from "@/entities/rule";
import { cn } from "@/shared/lib/utils";
import { useTestRule } from "../model/useTestRule";
import { Field, textareaClass } from "@/shared/ui/form";

// Поля события (схема Event backend), которые являются массивами
const LIST_FIELDS = new Set([
  "rule_groups",
  "mitre_ids",
  "mitre_tactics",
  "mitre_techniques",
  "recommendations",
  "payloads",
  "payload_indicators",
]);

// Обязательные поля Event — без них backend отвечает 422
const REQUIRED_EVENT = {
  rule_groups: [],
  mitre_ids: [],
  mitre_tactics: [],
  mitre_techniques: [],
  recommendations: [],
  payloads: [],
  payload_indicators: [],
  raw: {},
};

/** Пример события, на котором правило должно сработать: значения берутся из условий и pattern */
export function buildSampleEvent(rule: RuleCreateUpdateType) {
  const event: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    ...REQUIRED_EVENT,
  };
  const put = (field: string, value: string) => {
    event[field] = LIST_FIELDS.has(field) ? [value] : value;
  };
  if (rule.pattern && rule.fields[0]) put(rule.fields[0], rule.pattern);
  rule.conditions.forEach((condition) => put(condition.field, condition.value));
  return JSON.stringify(event, null, 2);
}

function errorText(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item: { loc?: unknown[]; msg?: string }) => `${item.loc?.join(".")}: ${item.msg}`)
        .join("; ");
    }
    return `Ошибка ${error.response?.status ?? "сети"}`;
  }
  return "Не удалось выполнить тест";
}

export function RuleTestPanel({ getRule }: { getRule: () => RuleCreateUpdateType }) {
  const [eventText, setEventText] = useState(() => buildSampleEvent(getRule()));
  const [parseError, setParseError] = useState<string | null>(null);
  const { mutate, data, error, isPending, reset } = useTestRule();

  const run = () => {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(eventText);
    } catch {
      setParseError("Событие должно быть корректным JSON");
      return;
    }
    setParseError(null);
    mutate({ rule: getRule(), event });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-muted">
        Правило проверяется в текущем виде из формы, без сохранения. Событие — нормализованное событие SIEM
        (поля как в Raw data).
      </p>
      <Field
        label="Событие (JSON)"
        required
        error={parseError ?? undefined}
      >
        <textarea
          value={eventText}
          onChange={(event) => {
            setEventText(event.target.value);
            reset();
          }}
          spellCheck={false}
          rows={16}
          className={cn(textareaClass, "font-mono text-xs")}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={run}
          disabled={isPending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-light px-3.5 text-sm font-medium text-white hover:bg-brand disabled:opacity-60"
        >
          <Play className="size-4" />
          {isPending ? "Проверка..." : "Запустить тест"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEventText(buildSampleEvent(getRule()));
            reset();
          }}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm text-ink hover:bg-surface-muted"
        >
          <RotateCcw className="size-4" />
          Пример по условиям
        </button>
      </div>
      {data && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium",
            data.matched
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-gray-200 bg-surface-muted text-ink",
          )}
        >
          {data.matched ? <CircleCheck className="size-4" /> : <CircleX className="size-4" />}
          {data.matched
            ? `Правило ${data.rule_id} сработало на событии`
            : `Правило ${data.rule_id} не сработало на событии`}
        </div>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {errorText(error)}
        </p>
      )}
    </div>
  );
}
