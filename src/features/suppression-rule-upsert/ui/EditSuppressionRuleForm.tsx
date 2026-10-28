"use client";

import { useSuppressionRule } from "@/entities/suppression-rule";
import { useUpdateSuppressionRule } from "../model/mutations";
import { SuppressionRuleEditForm } from "./SuppressionRuleEditForm";
import type { SuppressionRuleUpdateType } from "@/entities/suppression-rule";
import { toast } from "sonner";

export function EditSuppressionRuleForm({
  suppressionId,
}: {
  suppressionId: string;
}) {

  // 1. Получаем актуальное правило по ID
  const {
    data: rule,
    isPending,
    isError,
    error: fetchError,
  } = useSuppressionRule(suppressionId);
  const { mutate, isPending: isSaving, error: saveError } = useUpdateSuppressionRule();

  // 2. Обработка загрузки
  if (isPending) {
    return (
      <div className="p-8 text-center text-gray-500">
        Загрузка данных правила...
      </div>
    );
  }

  // 3. Обработка ошибки загрузки
  if (isError || !rule) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700">
        Не удалось загрузить правило:{" "}
        {fetchError?.message || "Правило не найдено"}
      </div>
    );
  }

  // 4. Маппинг данных под обновлённую схему
  const initialData: SuppressionRuleUpdateType = {
    description: rule.description ?? "",
    reason: rule.reason ?? "",
    match: {
      source_ip: rule.match?.source_ip ?? "",
      attack_type: rule.match?.attack_type ?? "",
    },
    action: rule.action.action ?? "ignore",
    suppressed: rule.action.suppressed ?? true,
    suppression_reason: rule.action.suppression_reason ?? "",
    tags: rule.tags ?? [],
  };

  const handleSubmit = async (data: SuppressionRuleUpdateType) => {
    mutate({ super_id: suppressionId, data }, {
      onSuccess: () => {
        toast.success("Обновили правило.", { position: "top-center" });
      },
      onError: () => {
        toast.error("Ошибка при обновлении на стороне сервера.", { position: "top-center" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          Ошибка сохранения: {saveError.message}
        </div>
      )}

      <SuppressionRuleEditForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      />
    </div>
  );
}
