"use client";

import { useForm, Controller } from "react-hook-form";
import { SuppressionRuleUpdateType } from "@/types/supers";

interface SuperRuleEditFormProps {
  initialData: SuppressionRuleUpdateType;
  onSubmit: (data: SuppressionRuleUpdateType) => Promise<void>;
  isSubmitting?: boolean;
}

export default function SuperRuleEditForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: SuperRuleEditFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<SuppressionRuleUpdateType>({
    defaultValues: {
      ...initialData,
      tags: initialData.tags || [],
      match: {
        source_ip: initialData.match?.source_ip || "",
        attack_type: initialData.match?.attack_type || "",
      },
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-4xl mx-auto pb-12"
    >
      {/* 1. Основная информация */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
          Основная информация
        </h2>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Статус подавления
          </span>

          {/* Toggle Suppressed */}
          <Controller
            name="suppressed"
            control={control}
            render={({ field: { value, onChange } }) => (
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm font-medium text-gray-700">
                  {value ? "Подавлено" : "Активно"}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            )}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <input
            {...register("description", {
              required: "Описание обязательно для заполнения",
              minLength: { value: 3, message: "Минимум 3 символа" },
            })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Описание правила..."
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Причина (Reason)
          </label>
          <textarea
            {...register("reason", {
              required: "Укажите причину создания правила",
            })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Внутренний vulnerability scanner..."
          />
          {errors.reason && (
            <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Теги (через запятую)
          </label>
          <Controller
            name="tags"
            control={control}
            render={({ field: { value, onChange } }) => (
              <input
                type="text"
                value={value?.join(", ") || ""}
                onChange={(e) =>
                  onChange(
                    e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="scanner, trusted, internal"
              />
            )}
          />
        </div>
      </div>

      {/* 2. Критерии совпадения (Match) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
          Критерии совпадения (Match)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Source IP
            </label>
            <input
              {...register("match.source_ip", {
                required: "IP-адрес обязателен",
              })}
              className="w-full font-mono rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="10.10.10.10"
            />
            {errors.match?.source_ip && (
              <p className="text-xs text-red-500 mt-1">
                {errors.match.source_ip.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Attack Type
            </label>
            <input
              {...register("match.attack_type", {
                required: "Тип атаки обязателен",
              })}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="network_scan"
            />
            {errors.match?.attack_type && (
              <p className="text-xs text-red-500 mt-1">
                {errors.match.attack_type.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Параметры действия (Action & Suppression) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
          Действие и детали подавления
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Действие (Action)
            </label>
            <select
              {...register("action", { required: "Выберите действие" })}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ignore">ignore</option>
              <option value="block">block</option>
              <option value="alert">alert</option>
            </select>
            {errors.action && (
              <p className="text-xs text-red-500 mt-1">
                {errors.action.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Причина подавления (Suppression Reason)
            </label>
            <input
              {...register("suppression_reason", {
                required: "Укажите причину подавления",
              })}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Trusted vulnerability scanner"
            />
            {errors.suppression_reason && (
              <p className="text-xs text-red-500 mt-1">
                {errors.suppression_reason.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </div>
    </form>
  );
}
