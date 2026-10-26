"use client";

import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import {
  RuleDetailTable,
  useRule,
  type RuleCreateUpdateType,
} from "@/entities/rule";
import { useDeleteRule } from "@/features/rule-delete";
import { useUpdateRule } from "@/features/rule-upsert";

export function RuleDetails({ ruleId }: { ruleId: string }) {
  const {
    data: rule,
    isPending,
    isRefetching,
    error,
    refetch,
  } = useRule(ruleId);

  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteRule();
  const { mutateAsync: updateMutateAsync, isPending: isUpdating } =
    useUpdateRule();

  // Возвращаем Promise, чтобы saveEditing в таблице мог дождаться завершения
  const handleUpdate = async (data: RuleCreateUpdateType) => {
    try {
      await updateMutateAsync({ rule_id: ruleId, data });
      toast.success("Поле успешно обновлено", { position: "top-center" });
    } catch {
      toast.error("Не удалось обновить поле", { position: "top-center" });
      throw new Error("Update failed"); // Пробрасываем ошибку, чтобы таблица не закрывала инпут
    }
  };

  if (isPending) {
    return (
      <div className="p-8 text-center text-gray-500">Загрузка таблицы...</div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-[#1E2B6D] font-bold">Не удалось загрузить Правило</p>
        <p className="text-xs text-[#64748B] max-w-xs mx-auto">
          Проверьте интернет-соединение или попробуйте перезагрузить данные
          вручную.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-2 border-gray-200 text-[#1E2B6D]"
        >
          Повторить попытку
        </Button>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="text-center py-20 text-gray-500">Правило не найдено</div>
    );
  }

  return (
    <RuleDetailTable
      key={rule.rule_id}
      rule={rule}
      onDelete={(id) => deleteMutate(id)}
      onUpdate={handleUpdate}
      onRefresh={() => refetch()}
      isRefreshing={isRefetching}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
    />
  );
}
