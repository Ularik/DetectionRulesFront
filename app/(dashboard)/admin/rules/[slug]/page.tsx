"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { RuleDetailTable } from "@/components/rule/RuleDetail/RuleDetail";
import { useOneRule } from "@/services/rules/ruleQueries";
import {
  useAdminUpdateRule,
  useDeleteRule,
} from "@/services/rules/adminRules/ruleQueries";
import { RuleCreateUpdateType, RuleType } from "@/types/rules";

export default function RulePage() {
  const { slug } = useParams();

  // Добавляем isRefetching для отслеживания повторных запросов
  const {
    data: rule,
    isPending,
    isRefetching,
    error,
    refetch,
  } = useOneRule(slug as string);

  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteRule();
  const { mutateAsync: updateMutateAsync, isPending: isUpdating } =
    useAdminUpdateRule();

  const handleDelete = (rule_id: string) => {
    deleteMutate(rule_id, {
      onSuccess: () => {
        toast.success("Правило удалено", { position: "top-center" });
      },
      onError: (err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          toast.error("Запись не найдена", { position: "top-center" });
        } else {
          toast.error("Ошибка удаления", { position: "top-center" });
        }
      },
    });
  };

  // Возвращаем Promise, чтобы saveEditing в таблице мог дождаться завершения
  const handleUpdate = async (data: RuleCreateUpdateType) => {
    try {
      const updatedRule: RuleType = await updateMutateAsync({
        rule_id: slug as string,
        data,
      });

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
    <div className="p-6">
      <RuleDetailTable
        key={rule.rule_id}
        rule={rule}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />
    </div>
  );
}
