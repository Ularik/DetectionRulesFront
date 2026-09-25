"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGroupByFields, useSeguence } from "@/services/autoFields/queries";
import { useCruleDetail, useUpdateCrule } from "@/services/crule/cRuleQueries";
import type {
  CorrelationRuleRequestCreateUpdateType,
  CorrelationRuleType,
} from "@/types/crules";

interface Props {
  correlationId: string;
}

type EditableRule = CorrelationRuleRequestCreateUpdateType;
type ArrayField = "sequence" | "group_by" | "recommendations" | "tags";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50";

function makeFormValues(rule: CorrelationRuleType): EditableRule {
  return {
    enabled: rule.enabled,
    scenario_type: rule.scenario_type,
    description: rule.description ?? "",
    window_seconds: rule.window_seconds,
    sequence: rule.sequence ?? [],
    group_by: rule.group_by ?? [],
    min_unique_categories: rule.min_unique_categories ?? null,
    severity: rule.severity ?? "",
    confidence: rule.confidence ?? 0,
    recommendations: rule.recommendations ?? [],
    tags: rule.tags ?? [],
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU");
}

function CorrelationRuleEditor({
  correlationId,
  rule,
}: Props & { rule: CorrelationRuleType }) {
  const router = useRouter();
  const { mutateAsync: updateCrule, isPending: isSaving } = useUpdateCrule();
  const { data: sequenceOptions = [], isLoading: isSequenceLoading } =
    useSeguence();
  const { data: groupByOptions = [], isLoading: isGroupByLoading } =
    useGroupByFields();
  const [form, setForm] = useState<EditableRule>(() => makeFormValues(rule));

  const updateField = <K extends keyof EditableRule>(
    field: K,
    value: EditableRule[K],
  ) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const updateArrayItem = (field: ArrayField, index: number, value: string) => {
    setForm((current) => {
      if (!current) return current;
      const values = [...(current[field] ?? [])];
      values[index] = value;
      return { ...current, [field]: values };
    });
  };

  const addArrayItem = (field: ArrayField) => {
    setForm((current) =>
      current
        ? { ...current, [field]: [...(current[field] ?? []), ""] }
        : current,
    );
  };

  const removeArrayItem = (field: ArrayField, index: number) => {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        [field]: (current[field] ?? []).filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      };
    });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload: EditableRule = {
        ...form,
        window_seconds: Number(form.window_seconds),
        min_unique_categories:
          form.min_unique_categories === null ||
          form.min_unique_categories === undefined
            ? null
            : Number(form.min_unique_categories),
        confidence:
          form.confidence === undefined || form.confidence === null
            ? undefined
            : Number(form.confidence),
        sequence: form.sequence?.filter(Boolean),
        group_by: form.group_by?.filter(Boolean),
        recommendations: form.recommendations?.filter(Boolean),
        tags: form.tags?.filter(Boolean),
      };

      await updateCrule({ correlation_id: correlationId, data: payload });
      toast.success("Правило обновлено", { position: "top-center" });
    } catch {
      toast.error("Не удалось обновить правило", { position: "top-center" });
    }
  };

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-5">
        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2 -ml-2"
          >
            <ArrowLeft /> Назад
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Правило корреляции
          </h1>
          <p className="mt-1 font-mono text-sm text-gray-500">
            {rule.correlation_id}
          </p>
        </div>
        <Button type="submit" disabled={isSaving}>
          <Save /> {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Основная информация
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Тип сценария
            <Input
              value={form.scenario_type}
              onChange={(event) =>
                updateField("scenario_type", event.target.value)
              }
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Критичность
            <select
              value={form.severity ?? ""}
              onChange={(event) => updateField("severity", event.target.value)}
              className={inputClass}
            >
              <option value="">Не указана</option>
              <option value="info">Info</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        </div>
        <label className="text-sm font-medium text-gray-700">
          Описание
          <Textarea
            value={form.description ?? ""}
            onChange={(event) => updateField("description", event.target.value)}
            rows={4}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">
            Окно, секунд
            <Input
              type="number"
              min={1}
              value={form.window_seconds}
              onChange={(event) =>
                updateField("window_seconds", Number(event.target.value))
              }
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Уверенность, %
            <Input
              type="number"
              min={0}
              max={100}
              value={form.confidence ?? ""}
              onChange={(event) =>
                updateField(
                  "confidence",
                  event.target.value === ""
                    ? undefined
                    : Number(event.target.value),
                )
              }
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Мин. уникальных категорий
            <Input
              type="number"
              min={0}
              value={form.min_unique_categories ?? ""}
              onChange={(event) =>
                updateField(
                  "min_unique_categories",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={form.enabled ?? false}
            onChange={(event) => updateField("enabled", event.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />{" "}
          Правило активно
        </label>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {(
          ["sequence", "group_by", "recommendations", "tags"] as ArrayField[]
        ).map((field) => (
          <section
            key={field}
            className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900">
                {field === "sequence"
                  ? "Последовательность"
                  : field === "group_by"
                    ? "Группировка"
                    : field === "recommendations"
                      ? "Рекомендации"
                      : "Теги"}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addArrayItem(field)}
              >
                <Plus /> Добавить
              </Button>
            </div>
            {(form[field] ?? []).map((value, index) => (
              <div key={`${field}-${index}`} className="flex gap-2">
                {field === "sequence" || field === "group_by" ? (
                  <select
                    value={value}
                    onChange={(event) =>
                      updateArrayItem(field, index, event.target.value)
                    }
                    disabled={
                      field === "sequence"
                        ? isSequenceLoading
                        : isGroupByLoading
                    }
                    aria-label={`${field} ${index + 1}`}
                    className={inputClass}
                  >
                    <option value="">
                      {(
                        field === "sequence"
                          ? isSequenceLoading
                          : isGroupByLoading
                      )
                        ? "Загрузка..."
                        : field === "sequence"
                          ? "Выберите тип инцидента"
                          : "Выберите поле группировки"}
                    </option>
                    {(field === "sequence"
                      ? sequenceOptions
                      : groupByOptions
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {value &&
                      !(
                        field === "sequence" ? sequenceOptions : groupByOptions
                      ).some((option) => option.value === value) && (
                        <option value={value}>{value}</option>
                      )}
                  </select>
                ) : (
                  <Input
                    value={value}
                    onChange={(event) =>
                      updateArrayItem(field, index, event.target.value)
                    }
                    aria-label={`${field} ${index + 1}`}
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem(field, index)}
                  aria-label="Удалить"
                >
                  <Trash2 className="text-red-500" />
                </Button>
              </div>
            ))}
            {(form[field] ?? []).length === 0 && (
              <p className="text-sm text-gray-500">Нет значений</p>
            )}
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          Метаданные
        </h2>
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-gray-500">Создано</dt>
            <dd>{formatDate(rule.created_at)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Изменено</dt>
            <dd>{formatDate(rule.updated_at)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Создал</dt>
            <dd>{rule.created_by ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Изменил</dt>
            <dd>{rule.updated_by ?? "—"}</dd>
          </div>
        </dl>
      </section>
    </form>
  );
}

export default function CorrelationDetailPage({ correlationId }: Props) {
  const {
    data: rule,
    isPending,
    isError,
    refetch,
  } = useCruleDetail(correlationId);

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Загрузка правила...
      </div>
    );
  }

  if (isError || !rule) {
    return (
      <div className="space-y-4 p-12 text-center">
        <p className="font-medium text-gray-700">
          Не удалось загрузить правило
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <CorrelationRuleEditor
      key={rule.updated_at}
      correlationId={correlationId}
      rule={rule}
    />
  );
}
