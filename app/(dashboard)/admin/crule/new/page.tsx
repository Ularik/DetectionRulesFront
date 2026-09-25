"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateCrule } from "@/services/crule/cRuleQueries";
import { useGroupByFields, useSeguence } from "@/services/autoFields/queries";

export interface CorrelationRuleRequestCreateUpdateType {
  enabled?: boolean;
  scenario_type: string;
  description?: string | null;
  window_seconds: number;
  sequence: string[];
  group_by: string[];
  min_unique_categories?: number | null;
  severity?: string | null;
  confidence?: number;
  recommendations?: string[];
  tags?: string[];
}

export default function CreateCorrelationRuleForm() {
  const { data: sequenceOptions = [], isLoading: isSequenceLoading } =
    useSeguence();
  const { data: groupByOptions = [], isLoading: isGroupByLoading } =
    useGroupByFields();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      enabled: true,
      scenario_type: "linux_privilege_escalation_chain",
      description:
        "Linux login or execution followed by privilege escalation and persistence",
      window_seconds: 1800,
      sequence: ["linux_remote_login", "linux_execution"],
      group_by: ["observer_host", "source_ip"],
      min_unique_categories: 1,
      severity: "critical",
      confidence: 85,
      recommendations: ["Проверить sudo/root активность пользователя."],
      tags: ["linux", "privilege_escalation"],
    },
  });

  const sequenceArray = useFieldArray({ control, name: "sequence" as never });
  const groupByArray = useFieldArray({ control, name: "group_by" as never });
  const recommendationsArray = useFieldArray({
    control,
    name: "recommendations" as never,
  });
  const tagsArray = useFieldArray({ control, name: "tags" as never });

  const { mutate } = useCreateCrule();

  const onSubmit = (data: CorrelationRuleRequestCreateUpdateType) => {
    console.log("Данные формы (Заглушка):", data);
    mutate(data, {
      onError: () => {
        console.log("error");
      },
    });
    toast.success("Заглушка: Форма успешно отправлена (см. консоль)");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-6"
    >
      <h2 className="text-xl font-bold text-gray-800 border-b pb-3">
        Создать правило корреляции
      </h2>
      {/* Основная информация */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Сценарий (scenario_type)
          </label>
          <input
            {...register("scenario_type", { required: "Укажите тип сценария" })}
            className="mt-1 w-full p-2 border rounded-md text-sm"
          />
          {errors.scenario_type && (
            <p className="text-red-500 text-xs mt-1">
              {errors.scenario_type.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Описание
        </label>
        <textarea
          {...register("description", { required: "Введите описание" })}
          rows={3}
          className="mt-1 w-full p-2 border rounded-md text-sm"
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">
            {errors.description.message}
          </p>
        )}
      </div>
      {/* Числовые и Enum параметры */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Окно (секунды)
          </label>
          <input
            type="number"
            {...register("window_seconds", {
              valueAsNumber: true,
              min: { value: 1, message: "Значение должно быть больше 0" },
            })}
            className="mt-1 w-full p-2 border rounded-md text-sm"
          />
          {errors.window_seconds && (
            <p className="text-red-500 text-xs mt-1">
              {errors.window_seconds.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Уверенность (%)
          </label>
          <input
            type="number"
            {...register("confidence", {
              valueAsNumber: true,
              min: 0,
              max: 100,
            })}
            className="mt-1 w-full p-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Severity
          </label>
          <select
            {...register("severity")}
            className="mt-1 w-full p-2 border rounded-md text-sm bg-white"
          >
            <option value="info">Info</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Поле Min Unique Categories & Active */}
      <div className="grid grid-cols-2 gap-4 items-start">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Min Unique Categories
          </label>
          <input
            type="number"
            {...register("min_unique_categories", {
              valueAsNumber: true,
              min: { value: 0, message: "Значение не может быть меньше 0" },
            })}
            className="mt-1 w-full p-2 border rounded-md text-sm"
          />
          {errors.min_unique_categories && (
            <p className="text-red-500 text-xs mt-1">
              {errors.min_unique_categories.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-7">
          <input
            type="checkbox"
            id="enabled"
            {...register("enabled")}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label
            htmlFor="enabled"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Правило активно (enabled)
          </label>
        </div>
      </div>

      {/* Массивы: Sequence */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            Последовательность (Sequence)
          </label>
          <button
            type="button"
            onClick={() => sequenceArray.append("" as never)}
            className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3 h-3" /> Добавить шаг
          </button>
        </div>
        {sequenceArray.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <select
              {...register(`sequence.${index}` as const)}
              disabled={isSequenceLoading}
              className="flex-1 p-2 border rounded-md text-sm bg-white"
            >
              <option value="">
                {isSequenceLoading ? "Загрузка..." : "Выберите тип инцидента"}
              </option>
              {sequenceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => sequenceArray.remove(index)}
              className="text-red-500 p-2 hover:bg-red-50 rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {/* Массивы: Group By */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            Группировка (Group By)
          </label>
          <button
            type="button"
            onClick={() => groupByArray.append("" as never)}
            className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3 h-3" /> Добавить поле
          </button>
        </div>
        {groupByArray.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <select
              {...register(`group_by.${index}` as const)}
              disabled={isGroupByLoading}
              className="flex-1 p-2 border rounded-md text-sm bg-white"
            >
              <option value="">
                {isGroupByLoading ? "Загрузка..." : "Выберите поле группировки"}
              </option>
              {groupByOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => groupByArray.remove(index)}
              className="text-red-500 p-2 hover:bg-red-50 rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {/* Массивы: Recommendations */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            Рекомендации
          </label>
          <button
            type="button"
            onClick={() => recommendationsArray.append("" as never)}
            className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3 h-3" /> Добавить рекомендацию
          </button>
        </div>
        {recommendationsArray.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <input
              {...register(`recommendations.${index}` as const)}
              className="flex-1 p-2 border rounded-md text-sm"
            />
            <button
              type="button"
              onClick={() => recommendationsArray.remove(index)}
              className="text-red-500 p-2 hover:bg-red-50 rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {/* Массивы: Tags */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">Теги</label>
          <button
            type="button"
            onClick={() => tagsArray.append("" as never)}
            className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3 h-3" /> Добавить тег
          </button>
        </div>
        {tagsArray.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <input
              {...register(`tags.${index}` as const)}
              className="flex-1 p-2 border rounded-md text-sm"
            />
            <button
              type="button"
              onClick={() => tagsArray.remove(index)}
              className="text-red-500 p-2 hover:bg-red-50 rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
      >
        Отправить (Заглушка)
      </button>
    </form>
  );
}
