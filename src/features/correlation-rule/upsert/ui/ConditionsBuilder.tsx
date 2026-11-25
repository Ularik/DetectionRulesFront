"use client";

import { useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Info, Plus, Trash2 } from "lucide-react";
import { toRuleStep } from "@/entities/correlation-rule";
import { cn } from "@/shared/lib/utils";
import { SearchSelect } from "@/shared/ui/form";
import {
  CONDITION_KINDS,
  CONDITION_KIND_LABELS,
  type ConditionCatalog,
  type ConditionKind,
} from "../model/useConditionCatalog";

// Блок «2. Условия корреляции»: упорядоченный sequence из Detection Rule / Detection Category / Attack Type.
// Произвольных AND/OR/NOT, вложенных групп и порогов частоты нет — их не поддерживает Matcher.

const KIND_STYLES: Record<ConditionKind, string> = {
  rule: "bg-[#eef5ff] text-[#0b4f94]",
  category: "bg-violet-50 text-violet-700",
  attack_type: "bg-amber-50 text-amber-800",
};

type Props = {
  steps: string[];
  onChange: (steps: string[]) => void;
  catalog: ConditionCatalog;
  invalid?: boolean;
};

export function ConditionsBuilder({ steps, onChange, catalog, invalid }: Props) {
  const [adding, setAdding] = useState(steps.length === 0);
  const [kind, setKind] = useState<ConditionKind>("rule");

  const options =
    kind === "rule"
      ? catalog.ruleOptions
      : kind === "category"
        ? catalog.categoryOptions
        : catalog.attackOptions;

  const add = (value: string) => {
    onChange([...steps, kind === "rule" ? toRuleStep(value) : value]);
    setAdding(false);
  };

  const move = (index: number, delta: number) => {
    const next = [...steps];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-ink-muted">
        Последовательность обнаружений, необходимая для совпадения правила
      </p>

      {steps.length > 0 && (
        <ol className="flex flex-col">
          {steps.map((step, index) => {
            const info = catalog.describe(step);
            return (
              <li key={`${step}:${index}`} className="flex flex-col">
                {index > 0 && <span aria-hidden className="ml-[22px] h-3 w-px bg-[#9cc0e6]" />}
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-xl border bg-white px-3 py-2.5",
                    info.warning ? "border-amber-300" : "border-line",
                  )}
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted">
                      Шаг {index + 1} ·
                      <span className={cn("rounded px-1.5 font-medium", KIND_STYLES[info.kind])}>
                        {CONDITION_KIND_LABELS[info.kind]}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "text-[13px] font-semibold break-words text-ink",
                        info.kind === "rule" && "font-mono",
                      )}
                    >
                      {info.title}
                    </span>
                    {info.subtitle && (
                      <span className="text-xs break-words text-ink-muted">{info.subtitle}</span>
                    )}
                    {info.warning && (
                      <span className="mt-0.5 flex items-start gap-1 text-[11px] text-amber-700">
                        <AlertTriangle aria-hidden className="mt-px size-3.5 shrink-0" />
                        {info.warning}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={`Поднять шаг ${index + 1}`}
                      className="rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === steps.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label={`Опустить шаг ${index + 1}`}
                      className="rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(steps.filter((_, itemIndex) => itemIndex !== index))}
                      aria-label={`Удалить шаг ${index + 1}`}
                      className="rounded-md p-1 text-ink-muted hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {adding ? (
        <div
          data-invalid={(invalid && !steps.length) || undefined}
          className="flex flex-col gap-3 rounded-xl border border-dashed border-[#9cc0e6] bg-surface-muted/60 p-3 data-invalid:border-red-400"
        >
          <div role="radiogroup" aria-label="Тип условия" className="grid grid-cols-3 gap-1.5">
            {CONDITION_KINDS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={kind === item.value}
                title={item.hint}
                onClick={() => setKind(item.value)}
                className={cn(
                  "min-w-0 truncate rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                  kind === item.value
                    ? "border-brand-light bg-white text-brand-light shadow-sm"
                    : "border-transparent text-ink-muted hover:bg-white hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink-muted">
            {CONDITION_KINDS.find((item) => item.value === kind)?.hint}
          </p>
          <SearchSelect
            key={kind}
            value=""
            onChange={add}
            options={options}
            loading={catalog.isPending}
            placeholder={
              kind === "rule"
                ? "Выберите правило обнаружения"
                : kind === "category"
                  ? "Выберите категорию детектирования"
                  : "Выберите тип атаки"
            }
            searchPlaceholder={kind === "rule" ? "ID или описание правила…" : "Поиск…"}
            ariaLabel={`Значение условия ${CONDITION_KIND_LABELS[kind]}`}
            invalid={invalid && !steps.length}
          />
          {steps.length > 0 && (
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="w-fit text-xs text-ink-muted hover:text-ink"
            >
              Отмена
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-brand-light hover:border-brand-light hover:bg-[#f2f9ff]"
        >
          <Plus className="size-4" />
          Добавить условие
        </button>
      )}

      <p className="flex items-start gap-2 rounded-lg bg-surface-muted px-3 py-2 text-[11px] leading-4 text-ink-muted">
        <Info aria-hidden className="mt-px size-3.5 shrink-0" />
        Шаги проверяются по порядку в пределах временного окна. Один инцидент может удовлетворить
        нескольким шагам, если содержит соответствующие признаки, — отдельного режима «строго разные
        инциденты» нет.
      </p>
    </div>
  );
}
