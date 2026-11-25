"use client";

import { useState } from "react";
import axios from "axios";
import { CircleCheck, CircleX, Play, RotateCcw } from "lucide-react";
import {
  CORRELATION_SEVERITY_LABELS,
  isRuleStep,
  ruleStepId,
  type CorrelationRuleRequestCreateUpdateType,
  type CorrelationSeverity,
  type CorrelationTestIncident,
} from "@/entities/correlation-rule";
import { Field, textareaClass } from "@/shared/ui/form";
import { cn } from "@/shared/lib/utils";
import { useTestCorrelationRule } from "../model/mutations";

// Значения для полей group_by в примере — одинаковые у всех инцидентов, чтобы они связались
function sampleGroupValue(field: string) {
  if (field.endsWith("_ip")) return field.startsWith("destination") ? "10.0.0.20" : "192.168.1.15";
  if (field.endsWith("_user")) return "admin";
  if (field.endsWith("_host")) return "srv-app-01";
  return `sample-${field}`;
}

/** Пример инцидентов, на которых правило должно сработать: по одному на шаг последовательности */
export function buildSampleIncidents(rule: CorrelationRuleRequestCreateUpdateType) {
  const steps = rule.sequence.length ? rule.sequence : ["suspicious_activity"];
  // Шаги укладываются в окно корреляции, не больше минуты между ними
  const stepMs = Math.min(60_000, (rule.window_seconds * 1000) / (steps.length + 1));
  const base = Date.now() - stepMs * steps.length;
  const groupFields = Object.fromEntries(
    rule.group_by.map((field) => [field, sampleGroupValue(field)]),
  );
  const incidents: CorrelationTestIncident[] = steps.map((step, index) => {
    const time = new Date(base + stepMs * index).toISOString();
    // rule:<id> — инцидент от конкретного правила обнаружения; иначе — категория / тип атаки
    const condition = isRuleStep(step)
      ? { detection_rule_ids: [ruleStepId(step)] }
      : { attack_type: step, detection_categories: [step] };
    return {
      incident_id: `TEST-${index + 1}`,
      ...condition,
      severity: rule.severity,
      start_time: time,
      end_time: time,
      ...groupFields,
    };
  });
  return JSON.stringify(incidents, null, 2);
}

function errorText(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item: { loc?: unknown[]; msg?: string }) => `${item.loc?.slice(1).join(".")}: ${item.msg}`)
        .join("; ");
    }
    return `Ошибка ${error.response?.status ?? "сети"}`;
  }
  return "Не удалось выполнить тест";
}

export function CorrelationRuleTestPanel({
  getRule,
}: {
  getRule: () => CorrelationRuleRequestCreateUpdateType;
}) {
  const [incidentsText, setIncidentsText] = useState(() => buildSampleIncidents(getRule()));
  const [parseError, setParseError] = useState<string | null>(null);
  const { mutate, data, error, isPending, reset } = useTestCorrelationRule();

  const run = () => {
    let incidents: unknown;
    try {
      incidents = JSON.parse(incidentsText);
    } catch {
      setParseError("Инциденты должны быть корректным JSON");
      return;
    }
    if (!Array.isArray(incidents) || incidents.some((item) => !item?.incident_id)) {
      setParseError("Нужен массив инцидентов, у каждого — incident_id");
      return;
    }
    setParseError(null);
    mutate({ rule: getRule(), incidents: incidents as CorrelationTestIncident[] });
  };

  const severity = data?.severity as CorrelationSeverity | null | undefined;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-muted">
        Правило проверяется в текущем виде из формы, без сохранения. Пример строится по
        последовательности и полям Group by: по одному инциденту на шаг, все в пределах окна.
      </p>
      <Field label="Инциденты (JSON-массив)" required error={parseError ?? undefined}>
        <textarea
          value={incidentsText}
          onChange={(event) => {
            setIncidentsText(event.target.value);
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
            setIncidentsText(buildSampleIncidents(getRule()));
            reset();
          }}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm text-ink hover:bg-surface-muted"
        >
          <RotateCcw className="size-4" />
          Пример по правилу
        </button>
      </div>
      {data && (
        <div
          className={cn(
            "flex flex-col gap-2 rounded-lg border px-3 py-2.5 text-sm",
            data.matched
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-gray-200 bg-surface-muted text-ink",
          )}
        >
          <p className="flex items-center gap-2 font-medium">
            {data.matched ? <CircleCheck className="size-4" /> : <CircleX className="size-4" />}
            {data.matched ? "Инциденты связались — правило сработало" : "Правило не сработало на этих инцидентах"}
          </p>
          {data.matched && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-ink-muted">Сценарий</dt>
              <dd className="font-mono">{data.scenario_type ?? "—"}</dd>
              <dt className="text-ink-muted">Критичность</dt>
              <dd>{severity ? (CORRELATION_SEVERITY_LABELS[severity] ?? severity) : "—"}</dd>
              <dt className="text-ink-muted">Уверенность</dt>
              <dd>{data.confidence === null ? "—" : `${data.confidence}%`}</dd>
              {data.recommendations.length > 0 && (
                <>
                  <dt className="text-ink-muted">Рекомендации</dt>
                  <dd>
                    <ul className="list-disc pl-4">
                      {data.recommendations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </>
              )}
            </dl>
          )}
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
