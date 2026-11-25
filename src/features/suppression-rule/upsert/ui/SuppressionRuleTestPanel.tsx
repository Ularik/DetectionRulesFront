"use client";

import { useState } from "react";
import { CircleCheck, CircleX, Play, RotateCcw } from "lucide-react";
import {
  suppressionActionLabel,
  suppressionDecisionLabel,
  suppressionSeverityLabel,
  type SuppressionRuleCreateType,
  type SuppressionTestIncident,
} from "@/entities/suppression-rule";
import { getErrorMessage } from "@/shared/lib/errors";
import { Field, textareaClass } from "@/shared/ui/form";
import { cn } from "@/shared/lib/utils";
import { useTestSuppressionRule } from "../model/mutations";

/** Пример инцидента, на котором правило должно сработать: значения берутся из условий match */
export function buildSampleIncident({ match }: SuppressionRuleCreateType) {
  const now = new Date().toISOString();
  const incident: SuppressionTestIncident = {
    incident_id: "TEST-1",
    attack_type: match.attack_type ?? "unknown",
    source_ip: match.source_ip ?? "192.168.1.15",
    destination_ip: match.destination_ip ?? "10.0.0.20",
    observer_host: match.observer_host ?? "wazuh",
    target_ports: [match.dst_port ?? 443],
    request_uris: [
      ...match.paths,
      ...match.path_prefixes.map((prefix) => `${prefix.replace(/\/?$/, "/")}index`),
    ],
    detection_rule_ids: match.detection_rule_id ? [match.detection_rule_id] : [],
    detection_categories: match.category ? [match.category] : [],
    severity: "high",
    risk_score: 70,
    decision: "malicious",
    action: "investigate",
    start_time: now,
    end_time: now,
  };
  // contains ищется в тексте события — кладём подстроки в описание
  if (match.contains.length) incident.summary = match.contains.join(" ");
  return JSON.stringify(incident, null, 2);
}

const valueOrDash = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "—" : value;

export function SuppressionRuleTestPanel({ getRule }: { getRule: () => SuppressionRuleCreateType }) {
  const [incidentText, setIncidentText] = useState(() => buildSampleIncident(getRule()));
  const [parseError, setParseError] = useState<string | null>(null);
  const { mutate, data, error, isPending, reset } = useTestSuppressionRule();

  const run = () => {
    let incident: unknown;
    try {
      incident = JSON.parse(incidentText);
    } catch {
      setParseError("Инцидент должен быть корректным JSON");
      return;
    }
    if (!incident || typeof incident !== "object" || Array.isArray(incident) || !("incident_id" in incident)) {
      setParseError("Нужен JSON-объект инцидента с полем incident_id");
      return;
    }
    setParseError(null);
    mutate({ rule: getRule(), incident: incident as SuppressionTestIncident });
  };

  const result = data?.result;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-muted">
        Правило проверяется в текущем виде из формы, без сохранения. Пример инцидента строится по условиям
        правила, поэтому оно должно на нём сработать — измените значения, чтобы проверить обратный случай.
      </p>
      <Field label="Инцидент (JSON)" required error={parseError ?? undefined}>
        <textarea
          value={incidentText}
          onChange={(event) => {
            setIncidentText(event.target.value);
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
            setIncidentText(buildSampleIncident(getRule()));
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
            {data.matched ? "Правило сработало — инцидент будет подавлен" : "Правило не сработало на этом инциденте"}
          </p>
          {data.matched && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-ink-muted">Режим</dt>
              <dd className="font-mono">{valueOrDash(data.mode)}</dd>
              <dt className="text-ink-muted">Причина</dt>
              <dd>{valueOrDash(data.reason)}</dd>
              {result && (
                <>
                  <dt className="text-ink-muted">Итоговая критичность</dt>
                  <dd>{valueOrDash(suppressionSeverityLabel(result.severity))}</dd>
                  <dt className="text-ink-muted">Решение</dt>
                  <dd>{valueOrDash(suppressionDecisionLabel(result.decision))}</dd>
                  <dt className="text-ink-muted">Действие</dt>
                  <dd>{valueOrDash(suppressionActionLabel(result.action))}</dd>
                  <dt className="text-ink-muted">Risk score</dt>
                  <dd>{valueOrDash(result.risk_score)}</dd>
                  <dt className="text-ink-muted">Suppressed</dt>
                  <dd>{result.suppressed ? "да" : "нет"}</dd>
                </>
              )}
            </dl>
          )}
        </div>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {getErrorMessage(error, "Не удалось выполнить тест")}
        </p>
      )}
    </div>
  );
}
