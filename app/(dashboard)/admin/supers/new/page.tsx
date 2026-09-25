"use client";

import React, { useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import {
  SuppresionRuleCreateType,
  SuppressionMatchTypes,
  MatchFieldType,
} from "@/types/supers";
import {
  useSuperRuleCreate,
  useSupersMatchFields,
} from "@/services/supers/queries";

// Локальный интерфейс для строки в конструкторе условий
interface ActiveMatchRule {
  fieldKey: string; // Имя поля, например 'source_ip' или 'paths'
  value: string | string[]; // Значение или массив значений
}

interface FormValues extends Omit<SuppresionRuleCreateType, "match"> {
  // Заменяем плоский match на массив динамических правил для удобной работы с useFieldArray
  activeMatches: ActiveMatchRule[];
}

export default function CreateSuperRule() {
  const { data: matchFieldsData, isPending: isMatchLoading } =
    useSupersMatchFields();
  const { mutate, isPending: isSubmitting } = useSuperRuleCreate();

  const [selectedFieldToAdd, setSelectedFieldToAdd] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      enabled: true,
      description: "",
      reason: "",
      tags: [""],
      activeMatches: [],
      action: {
        mode: "supress",
        decision: "benign",
        severity: "low",
        risk_score: 0,
        action: "ignore",
        suppressed: true,
        suppression_reason: "",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "activeMatches",
  });

  const tagsArray = useFieldArray({
    control,
    name: "tags" as never,
  });

  // Вспомогательный словарь полей для быстрого доступа по key
  const fieldsMap = React.useMemo(() => {
    const map = new Map<string, MatchFieldType>();
    matchFieldsData?.items?.forEach((item) => map.set(item.field, item));
    return map;
  }, [matchFieldsData]);

  // Добавление нового условия
  const handleAddCondition = () => {
    if (!selectedFieldToAdd) return;

    const fieldMeta = fieldsMap.get(selectedFieldToAdd);
    if (!fieldMeta) return;

    // Начальное значение в зависимости от того, массив это или единичное значение
    const initialValue =
      fieldMeta.multiple || fieldMeta.ui_control === "multi_input" ? [""] : "";

    append({
      fieldKey: selectedFieldToAdd,
      value: initialValue,
    });

    setSelectedFieldToAdd("");
  };

  // Трансформация формы перед отправкой на бэкенд
  const onSubmit = (formData: FormValues) => {
    // Собираем объект match обратно в структуру SuppressionMatchTypes
    const matchResult: SuppressionMatchTypes = {
      paths: [],
      path_prefixes: [],
      contains: [],
    };

    formData.activeMatches.forEach((rule) => {
      const meta = fieldsMap.get(rule.fieldKey);
      if (!meta) return;

      if (Array.isArray(rule.value)) {
        const cleanedArray = rule.value.filter(
          (val: string) => val && val.trim() !== "",
        );
        (matchResult as unknown as Record<string, string | number | string[]>)[
          rule.fieldKey
        ] = cleanedArray;
      } else if (
        rule.value !== "" &&
        rule.value !== null &&
        rule.value !== undefined
      ) {
        (matchResult as unknown as Record<string, string | number | string[]>)[
          rule.fieldKey
        ] =
          meta.type === "number" || meta.ui_control === "number"
            ? Number(rule.value)
            : rule.value;
      }
    });

    const payload: SuppresionRuleCreateType = {
      enabled: formData.enabled,
      description: formData.description,
      reason: formData.reason,
      match: matchResult,
      action: formData.action,
      tags: formData.tags?.filter((t) => t && t.trim() !== ""),
    };

    mutate(payload);
  };

  if (isMatchLoading) {
    return <div className="p-6">Загрузка полей условий...</div>;
  }

  // Список полей, которые еще НЕ добавлены в условия
  const availableFields =
    matchFieldsData?.items.filter(
      (item) => !fields.some((f) => f.fieldKey === item.field),
    ) || [];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Создание правила подавления</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Основные параметры */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">
            Основные параметры
          </h2>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              {...register("enabled")}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="enabled" className="font-medium">
              Включено (Enabled)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <input
              type="text"
              {...register("description")}
              className="w-full border rounded p-2"
              placeholder="Описание правила"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Причина</label>
            <textarea
              {...register("reason")}
              className="w-full border rounded p-2"
              rows={2}
            />
          </div>
        </section>

        {/* Динамическая секция MATCH */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">
            Условия соответствия (Match)
          </h2>

          {/* Список уже добавленных условий */}
          <div className="space-y-4">
            {fields.map((fieldItem, index) => {
              const meta = fieldsMap.get(fieldItem.fieldKey);
              if (!meta) return null;

              return (
                <div
                  key={fieldItem.id}
                  className="p-4 border rounded-lg bg-gray-50 relative space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-800">
                        {meta.label}
                      </span>{" "}
                      <span className="text-xs text-gray-500">
                        ({meta.field})
                      </span>
                      <p className="text-xs text-gray-600">
                        {meta.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Удалить условие
                    </button>
                  </div>

                  {/* Рендеринг нужного UI контрола в зависимости от типа поля */}
                  <div className="mt-2">
                    <MatchFieldControl
                      meta={meta}
                      index={index}
                      control={control}
                      register={register}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Выпадающий список для добавления нового условия */}
          <div className="flex gap-2 pt-2">
            <select
              value={selectedFieldToAdd}
              onChange={(e) => setSelectedFieldToAdd(e.target.value)}
              className="border rounded p-2 flex-1"
            >
              <option value="">-- Выберите условие для добавления --</option>
              {availableFields.map((item) => (
                <option key={item.field} value={item.field}>
                  {item.label} ({item.field})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddCondition}
              disabled={!selectedFieldToAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Добавить условие
            </button>
          </div>
        </section>

        {/* Секция Action Details */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">
            Детали действия
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Режим обработки *
              </label>
              <input
                type="text"
                {...register("action.mode", { required: true })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Решение *
              </label>
              <select
                {...register("action.decision", { required: true })}
                className="w-full border rounded p-2"
              >
                <option value="malicious">malicious</option>
                <option value="suspicious">suspicious</option>
                <option value="benign">benign</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Суровость *
              </label>
              <select
                {...register("action.severity", { required: true })}
                className="w-full border rounded p-2"
              >
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
                <option value="info">info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Выполняемое действие
              </label>
              <select
                {...register("action.action")}
                className="w-full border rounded p-2"
              >
                <option value="ignore">ignore</option>
                <option value="block">block</option>
                <option value="investigate">investigate</option>
                <option value="monitor">monitor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Оценка риска (0-100) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                {...register("action.risk_score", {
                  required: true,
                  valueAsNumber: true,
                  min: 0,
                  max: 100,
                })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Причина подавления *
              </label>
              <input
                type="text"
                {...register("action.suppression_reason", {
                  required: true,
                })}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                id="suppressed"
                {...register("action.suppressed")}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="suppressed" className="font-medium">
                Подавление включено
              </label>
            </div>
          </div>
        </section>

        {/* Кнопка отправки */}
        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Сохранение..." : "Создать правило"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Отдельный компонент для рендеринга ввода под конкретный ui_control
function MatchFieldControl({
  meta,
  index,
  control,
  register,
}: {
  meta: MatchFieldType;
  index: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
}) {
  // Для множественных полей (multi_input)
  if (meta.multiple || meta.ui_control === "multi_input") {
    return (
      <Controller
        control={control}
        name={`activeMatches.${index}.value`}
        render={({ field }) => {
          const values: string[] = Array.isArray(field.value)
            ? field.value
            : [""];

          const handleUpdate = (idx: number, val: string) => {
            const copy = [...values];
            copy[idx] = val;
            field.onChange(copy);
          };

          const handleAdd = () => {
            field.onChange([...values, ""]);
          };

          const handleRemove = (idx: number) => {
            field.onChange(values.filter((_, i) => i !== idx));
          };

          return (
            <div className="space-y-2">
              {values.map((val, subIdx) => (
                <div key={subIdx} className="flex gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleUpdate(subIdx, e.target.value)}
                    placeholder={
                      meta.example ? `Пример: ${String(meta.example)}` : ""
                    }
                    className="flex-1 border rounded p-2 text-sm bg-white"
                  />
                  {values.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(subIdx)}
                      className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAdd}
                className="text-xs text-blue-600 hover:underline"
              >
                + Добавить значение в {meta.label}
              </button>
            </div>
          );
        }}
      />
    );
  }

  // Обычный number
  if (meta.type === "number" || meta.ui_control === "number") {
    return (
      <input
        type="number"
        min={meta.min}
        max={meta.max}
        {...register(`activeMatches.${index}.value`)}
        placeholder={meta.example ? `Пример: ${meta.example}` : ""}
        className="w-full border rounded p-2 text-sm bg-white"
      />
    );
  }

  // Обычный текстовый input по умолчанию
  return (
    <input
      type="text"
      {...register(`activeMatches.${index}.value`)}
      placeholder={meta.example ? `Пример: ${meta.example}` : ""}
      className="w-full border rounded p-2 text-sm bg-white"
    />
  );
}
