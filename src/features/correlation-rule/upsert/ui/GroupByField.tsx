"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { useGroupByFields } from "@/entities/correlation-rule";
import { cn } from "@/shared/lib/utils";

// group_by — какие инциденты разрешено связывать: выбранные поля должны совпасть одновременно (И, не «любое из»)

export function GroupByField({
  value,
  onChange,
  invalid,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  invalid?: boolean;
}) {
  const { data: fields = [], isPending, isError, refetch } = useGroupByFields();
  const unknown = isPending ? [] : value.filter((item) => !fields.some((field) => field.value === item));

  const toggle = (field: string) =>
    onChange(value.includes(field) ? value.filter((item) => item !== field) : [...value, field]);

  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label="Группировка"
        data-invalid={invalid || undefined}
        className="grid gap-1.5 rounded-xl data-invalid:ring-1 data-invalid:ring-red-400 sm:grid-cols-2"
      >
        {isPending &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-line-muted" />
          ))}
        {fields.map((field) => {
          const checked = value.includes(field.value);
          return (
            <button
              key={field.value}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggle(field.value)}
              title={field.description}
              className={cn(
                "flex min-w-0 items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
                checked ? "border-brand-light bg-[#f2f9ff]" : "border-line bg-white hover:bg-surface-muted",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                  checked ? "border-brand-light bg-brand-light text-white" : "border-line bg-white",
                )}
              >
                {checked && <Check className="size-3" />}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[13px] text-ink">{field.label}</span>
                <span className="truncate font-mono text-[11px] text-ink-muted">{field.value}</span>
              </span>
            </button>
          );
        })}
      </div>

      {isError && (
        <p className="text-[11px] text-red-600">
          Не удалось загрузить поля группировки.{" "}
          <button type="button" onClick={() => refetch()} className="font-medium underline">
            Повторить
          </button>
        </p>
      )}

      {unknown.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          <span className="flex items-start gap-1.5">
            <AlertTriangle aria-hidden className="mt-px size-3.5 shrink-0" />
            Значения не являются полями группировки (например, категории обнаружения сюда не относятся).
            Проверьте и уберите их:
          </span>
          <span className="flex flex-wrap gap-1.5">
            {unknown.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2 py-0.5 font-mono"
              >
                {item}
                <button
                  type="button"
                  aria-label={`Убрать ${item}`}
                  onClick={() => onChange(value.filter((other) => other !== item))}
                  className="hover:text-red-600"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </span>
        </div>
      )}

      <p className="text-[11px] text-ink-muted">
        {value.length > 1
          ? `Инциденты связываются, только если совпадают все выбранные поля: ${value.join(" И ")}.`
          : "Выбранные поля — совместные признаки: при нескольких полях должны совпасть все сразу, а не любое из них."}
      </p>
    </div>
  );
}
